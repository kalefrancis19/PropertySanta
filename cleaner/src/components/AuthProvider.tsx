'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  authState: AuthState;
  signUp: (userData: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<AuthState>;
  loginWithOTP: (credentials: { email: string; otp: string }) => Promise<AuthState>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [loading, setLoading] = useState(true);

  // Load initial auth state
  useEffect(() => {
    const loadInitialAuthState = async () => {
      try {
        console.log('AuthProvider: Loading initial auth state...');
        
        // Check for existing token and validate it
        const isTokenValid = await authService.validateAndRefreshToken();
        const storedToken = authService.getStoredToken();
        console.log('AuthProvider: Token validation result:', isTokenValid);
        console.log('AuthProvider: Stored token found:', !!storedToken);
        
        if (isTokenValid && storedToken) {
          console.log('AuthProvider: Valid token found, fetching user data...');
          
          // Try to get current user with stored token
          const user = await authService.getCurrentUser();
          
          if (user) {
            console.log('AuthProvider: User data retrieved successfully');
            setAuthState({
              isAuthenticated: true,
              user,
              token: storedToken,
            });
          } else {
            console.log('AuthProvider: Failed to get user data, clearing token');
            await authService.logout();
            setAuthState({
              isAuthenticated: false,
              user: null,
              token: null,
            });
          }
        } else {
          console.log('AuthProvider: No valid token found, setting unauthenticated state');
          setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
          });
        }
        
        console.log('AuthProvider: Initial auth state loaded');
      } catch (error) {
        console.error('Error loading initial auth state:', error);
        await authService.logout();
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialAuthState();
  }, []);

  // Debug auth state changes
  useEffect(() => {
    console.log('AuthProvider: Auth state updated:', authState);
  }, [authState]);

  const signUp = async (userData: { name: string; email: string; password: string; phone?: string }) => {
    try {
      const newAuthState = await authService.signUp(userData);
      
      if (newAuthState.error) {
        throw new Error(newAuthState.error);
      }
      
      setAuthState(newAuthState);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      console.log('AuthProvider: Starting login process...');
      
      // Clear old auth state and localStorage first
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
      });
      
      // Clear localStorage to remove old token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      
      console.log('AuthProvider: Calling authService.loginWithPassword...');
      const newAuthState = await authService.loginWithPassword(credentials);
      console.log('AuthProvider: Received auth state from service:', newAuthState);
      
      if (newAuthState.error) {
        throw new Error(newAuthState.error);
      }
      
      console.log('AuthProvider: Setting new auth state...');
      setAuthState(newAuthState);
      console.log('AuthProvider: Auth state updated successfully');
      
      // Return the auth state for immediate use
      return newAuthState;
    } catch (error) {
      console.error('AuthProvider: Login error:', error);
      throw error;
    }
  };

  const loginWithOTP = async (credentials: { email: string; otp: string }) => {
    try {
      // Clear old auth state and localStorage first
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
      });
      
      // Clear localStorage to remove old token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      
      const newAuthState = await authService.loginWithOTP(credentials);
      
      if (newAuthState.error) {
        throw new Error(newAuthState.error);
      }
      
      setAuthState(newAuthState);
      return newAuthState;
    } catch (error) {
      console.error('OTP login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthProvider: Starting logout process...');
      
      await authService.logout();
      console.log('AuthProvider: Backend logout successful');
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
      });
      console.log('AuthProvider: Auth state cleared successfully');
    } catch (error) {
      console.error('AuthProvider: Logout error:', error);
      // Even if backend logout fails, clear the local state
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
      });
    }
  };

  const value: AuthContextType = {
    authState,
    signUp,
    login,
    loginWithOTP,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 