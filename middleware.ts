import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(identifier: string, limit: number = 60, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userRequests = rateLimitStore.get(identifier);

  if (!userRequests || now > userRequests.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return false;
  }

  if (userRequests.count >= limit) {
    return true;
  }

  userRequests.count++;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get client IP for rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  request.ip || 
                  'unknown';

  // Add security headers to all responses
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Only in production, enforce HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    // Skip rate limiting for Google OAuth endpoints
    if (pathname === '/api/auth/callback/google' || 
        pathname === '/api/auth/signin/google' ||
        pathname.startsWith('/api/auth/callback/google/') ||
        pathname.startsWith('/api/auth/signin/google/')) {
      return response;
    }

    let rateLimit = 60; // Default: 60 requests per minute
    let windowMs = 60000; // 1 minute

    // Different rate limits for different endpoints
    if (pathname.startsWith('/api/auth/')) {
      rateLimit = 10; // Stricter for auth endpoints
    } else if (pathname.startsWith('/api/admin/')) {
      rateLimit = 100; // More lenient for admin operations
    } else if (pathname.startsWith('/api/orders') && request.method === 'POST') {
      rateLimit = 5; // Very strict for order creation
      windowMs = 300000; // 5 minutes
    }

    if (isRateLimited(`${clientIp}_${pathname}`, rateLimit, windowMs)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMITED'
        },
        { status: 429 }
      );
    }
  }

  // Skip middleware for these paths
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/api/auth/') ||
      pathname.startsWith('/auth/') ||
      pathname === '/api/auth/callback/google' ||
      pathname === '/api/auth/signin/google' ||
      pathname === '/' ||
      pathname === '/shop' ||
      pathname === '/products' ||
      pathname.startsWith('/products/') ||
      pathname.includes('.')) {
    return response;
  }

  try {
    // Get the token from the request
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Protected routes that require authentication
    const protectedRoutes = ['/orders', '/profile', '/cart', '/checkout'];
    const adminRoutes = ['/admin'];

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    // Check if user is trying to access protected routes without authentication
    if (isProtectedRoute && !token) {
      const redirectUrl = new URL('/auth/signin', request.url);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user is trying to access admin routes without admin role
    if (isAdminRoute) {
      if (!token) {
        const redirectUrl = new URL('/auth/signin', request.url);
        redirectUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(redirectUrl);
      }

      if (token.role !== 'admin') {
        // Log unauthorized access attempt
        console.warn(`Unauthorized admin access attempt: ${token.email} tried to access ${pathname}`);
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Check for suspended users
    if (token && token.status === 'suspended') {
      // Clear the session for suspended users
      const response = NextResponse.redirect(new URL('/auth/signin', request.url));
      response.cookies.delete('next-auth.session-token');
      response.cookies.delete('__Secure-next-auth.session-token');
      return response;
    }

    // Check for deactivated users
    if (token && token.isActive === false) {
      // Clear the session for deactivated users
      console.log(`Deactivated user attempted to access: ${token.email} -> ${pathname}`);
      const response = NextResponse.redirect(new URL('/auth/signin?message=Your account has been deactivated', request.url));
      response.cookies.delete('next-auth.session-token');
      response.cookies.delete('__Secure-next-auth.session-token');
      return response;
    }

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    
    // In case of token verification error, redirect to signin for protected routes
    const protectedRoutes = ['/orders', '/profile', '/cart', '/checkout', '/admin'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    
    if (isProtectedRoute) {
      const redirectUrl = new URL('/auth/signin', request.url);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 