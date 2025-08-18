'use client';

import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('customer')[];
}

export default function ProtectedRoute({ children, allowedRoles = ['admin', 'cleaner', 'customer'] }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only run the check if we're not still loading auth state
    if (!loading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // If user role is not allowed, redirect to home
      if (user && !allowedRoles.includes(user.role)) {
        console.warn(`Access denied. User role ${user.role} is not in allowed roles:`, allowedRoles);
        router.push('/');
      }
    }
  }, [isAuthenticated, user, loading, router, allowedRoles]);

  // Show loading state while checking auth
  if (loading || (isAuthenticated === undefined)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // If not authenticated, show nothing (will redirect to login)
  if (!isAuthenticated) {
    return null;
  }

  // If user role is not allowed, show access denied
  if (user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // If authenticated and role is allowed, render children
  return <>{children}</>;
};

export const withAuth = (Component: React.ComponentType, allowedRoles?: ('customer')[]) => {
  return function WithAuth(props: any) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};
