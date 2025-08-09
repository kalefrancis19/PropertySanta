'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { authState, loading } = useAuth();
  const router = useRouter();

  console.log('ProtectedRoute: Auth state:', authState);
  console.log('ProtectedRoute: Loading:', loading);

  useEffect(() => {
    console.log('ProtectedRoute: Checking authentication...');
    if (!loading && !authState.isAuthenticated) {
      console.log('ProtectedRoute: Not authenticated, redirecting to login...');
      router.push('/');
    } else if (!loading && authState.isAuthenticated) {
      console.log('ProtectedRoute: Authenticated, allowing access...');
    }
  }, [authState.isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}; 