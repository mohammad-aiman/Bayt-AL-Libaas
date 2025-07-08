'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string | string[];
  fallbackUrl?: string;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
}

/**
 * Client-side authentication guard component
 * Protects pages/components from unauthorized access
 */
export default function AuthGuard({
  children,
  requireAuth = true,
  requireRole,
  fallbackUrl = '/auth/signin',
  loadingComponent,
  unauthorizedComponent,
}: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      // Wait for session to load
      if (status === 'loading') {
        return;
      }

      // Check if authentication is required
      if (requireAuth && status === 'unauthenticated') {
        toast.error('Please sign in to access this page');
        router.push(fallbackUrl);
        return;
      }

      // Check role-based access
      if (requireRole && session?.user) {
        const userRole = session.user.role;
        const requiredRoles = Array.isArray(requireRole) ? requireRole : [requireRole];

        if (!requiredRoles.includes(userRole)) {
          toast.error('You do not have permission to access this page');
          router.push('/');
          return;
        }
      }

      // If we reach here, user is authorized
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [session, status, requireAuth, requireRole, router, fallbackUrl]);

  // Show loading state
  if (isLoading || status === 'loading') {
    return loadingComponent || <AuthLoadingSpinner />;
  }

  // Show unauthorized state
  if (requireAuth && !session) {
    return unauthorizedComponent || <UnauthorizedMessage />;
  }

  // Show role-based unauthorized state
  if (requireRole && session?.user) {
    const userRole = session.user.role;
    const requiredRoles = Array.isArray(requireRole) ? requireRole : [requireRole];

    if (!requiredRoles.includes(userRole)) {
      return unauthorizedComponent || <ForbiddenMessage requiredRole={requireRole} userRole={userRole} />;
    }
  }

  // User is authorized, render children
  return isAuthorized ? <>{children}</> : null;
}

/**
 * Hook for checking authentication status
 */
export function useAuthGuard(options: {
  requireAuth?: boolean;
  requireRole?: string | string[];
} = {}) {
  const { data: session, status } = useSession();
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAuthorized: false,
    isLoading: true,
    user: null as any,
  });

  useEffect(() => {
    const checkAuth = () => {
      const isLoading = status === 'loading';
      const isAuthenticated = !!session?.user;
      let isAuthorized = true;

      // Check role-based access
      if (options.requireRole && session?.user) {
        const userRole = session.user.role;
        const requiredRoles = Array.isArray(options.requireRole) 
          ? options.requireRole 
          : [options.requireRole];
        
        isAuthorized = requiredRoles.includes(userRole);
      }

      // Check authentication requirement
      if (options.requireAuth && !isAuthenticated) {
        isAuthorized = false;
      }

      setAuthState({
        isAuthenticated,
        isAuthorized,
        isLoading,
        user: session?.user || null,
      });
    };

    checkAuth();
  }, [session, status, options.requireAuth, options.requireRole]);

  return authState;
}

/**
 * Loading spinner component
 */
function AuthLoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    </div>
  );
}

/**
 * Unauthorized message component
 */
function UnauthorizedMessage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
        <p className="text-gray-600 mb-6">You need to sign in to access this page.</p>
        <div className="space-x-4">
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Forbidden message component
 */
function ForbiddenMessage({ 
  requiredRole, 
  userRole 
}: { 
  requiredRole: string | string[];
  userRole: string;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Forbidden</h2>
        <p className="text-gray-600 mb-2">
          You do not have permission to access this page.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Required role: {Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole}
          <br />
          Your role: {userRole}
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

/**
 * Higher-order component for page-level authentication
 */
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  authOptions: {
    requireAuth?: boolean;
    requireRole?: string | string[];
    fallbackUrl?: string;
  } = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard {...authOptions}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };
}

/**
 * Role-based conditional rendering component
 */
export function RoleGate({
  children,
  allowedRoles,
  fallback,
}: {
  children: React.ReactNode;
  allowedRoles: string | string[];
  fallback?: React.ReactNode;
}) {
  const { data: session } = useSession();

  if (!session?.user) {
    return fallback || null;
  }

  const userRole = session.user.role;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(userRole)) {
    return fallback || null;
  }

  return <>{children}</>;
} 