import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  requireRole?: string | string[];
  allowSelf?: boolean; // Allow users to access their own resources
}

/**
 * Authentication middleware for API routes
 * Provides session validation, role-based access control, and security headers
 */
export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Add security headers
      const headers = new Headers();
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-Frame-Options', 'DENY');
      headers.set('X-XSS-Protection', '1; mode=block');
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Get session
      const session = await getServerSession(authOptions);

      // Check if authentication is required
      if (options.requireAuth !== false) {
        if (!session || !session.user) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Authentication required',
              code: 'UNAUTHORIZED'
            },
            { status: 401, headers }
          );
        }
      }

      // Check role-based access
      if (options.requireRole && session?.user) {
        const userRole = session.user.role;
        const requiredRoles = Array.isArray(options.requireRole) 
          ? options.requireRole 
          : [options.requireRole];

        if (!requiredRoles.includes(userRole)) {
          // Log unauthorized access attempt
          console.warn(`Unauthorized access attempt: User ${session.user.email} (${userRole}) tried to access ${req.url}`);
          
          return NextResponse.json(
            { 
              success: false, 
              message: 'Insufficient permissions',
              code: 'FORBIDDEN'
            },
            { status: 403, headers }
          );
        }
      }

      // Attach user to request
      const authenticatedReq = req as AuthenticatedRequest;
      if (session?.user) {
        authenticatedReq.user = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
        };
      }

      // Call the actual handler
      const response = await handler(authenticatedReq);

      // Add security headers to response
      headers.forEach((value, key) => {
        response.headers.set(key, value);
      });

      return response;

    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Check if user can access a specific resource
 * Used for resources that belong to specific users
 */
export function canAccessResource(
  user: { id: string; role: string },
  resourceUserId: string,
  options: { allowAdmin?: boolean } = {}
): boolean {
  // Admin can access all resources (if allowed)
  if (options.allowAdmin !== false && user.role === 'admin') {
    return true;
  }

  // Users can access their own resources
  return user.id === resourceUserId;
}

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Rate limiting helper (basic implementation)
 */
export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier);

    if (!userRequests || now > userRequests.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return false;
    }

    if (userRequests.count >= this.maxRequests) {
      return true;
    }

    userRequests.count++;
    return false;
  }

  getRemainingRequests(identifier: string): number {
    const userRequests = this.requests.get(identifier);
    if (!userRequests || Date.now() > userRequests.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - userRequests.count);
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter();

/**
 * Audit logging for sensitive operations
 */
export interface AuditLog {
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  details?: any;
}

export async function logAuditEvent(
  user: { id: string; email: string },
  action: string,
  resource: string,
  req: NextRequest,
  details: any = {}
): Promise<void> {
  // Determine severity and category based on action
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let category: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system' | 'security' = 'system';
  
  try {
    await connectDB();

    // Set severity and category based on action
    if (action.includes('ERROR') || action.includes('FAILED')) {
      severity = 'medium';
      category = 'security';
    }
    
    if (action.includes('LOGIN') || action.includes('LOGOUT') || action.includes('SIGNUP')) {
      category = 'authentication';
      severity = action.includes('FAILED') ? 'high' : 'low';
    }
    
    if (action.includes('UNAUTHORIZED') || action.includes('FORBIDDEN')) {
      category = 'authorization';
      severity = 'high';
    }
    
    if (action.includes('CREATE') || action.includes('UPDATE') || action.includes('DELETE')) {
      category = 'data_modification';
      severity = 'medium';
    }
    
    if (action.includes('VIEW') || action.includes('FETCH')) {
      category = 'data_access';
      severity = 'low';
    }

    if (action.includes('ADMIN') || action.includes('BULK')) {
      severity = 'high';
    }

    const auditLog = new AuditLog({
      userId: user.id,
      userEmail: user.email,
      action,
      resource,
      resourceId: details.resourceId,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      timestamp: new Date(),
      success: details.success !== false,
      details: details,
      severity,
      category,
    });

    await auditLog.save();
    
    // Log important audit events to console (only for high severity)
    if (['high', 'critical'].includes(severity)) {
      console.warn('AUDIT LOG:', JSON.stringify({
        userId: user.id,
        userEmail: user.email,
        action,
        resource,
        severity,
        category,
        success: details.success !== false,
        timestamp: new Date().toISOString(),
      }));
    }

  } catch (error) {
    // Don't throw error for audit logging failures, just log to console
    console.error('Failed to save audit log:', error);
    // Only log fallback for important events
    if (['high', 'critical'].includes(severity)) {
      console.warn('AUDIT LOG (FALLBACK):', JSON.stringify({
        userId: user.id,
        userEmail: user.email,
        action,
        resource,
        success: details.success !== false,
        timestamp: new Date().toISOString(),
        error: 'Failed to save to database'
      }));
    }
  }
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
} 