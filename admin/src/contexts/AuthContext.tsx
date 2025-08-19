'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api, { ApiResponse } from '@/services/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadUserFromToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        // Set the token in axios headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Try to get user data from localStorage first
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            if (isMounted) {
              setUser(user);
              setLoading(false);
            }
            return;
          } catch (e) {
            console.error('Failed to parse stored user:', e);
            localStorage.removeItem('user');
          }
        }
        
        // If no stored user, fetch from server
        const response = await api.get<{ user: User }>('/auth/me');
        
        if (response.data?.user) {
          // Store user in localStorage for future use
          localStorage.setItem('user', JSON.stringify(response.data.user));
          if (isMounted) {
            setUser(response.data.user);
          }
        } else {
          // If no user data in response, clear the invalid token
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          if (isMounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      loadUserFromToken();
    } else {
      setLoading(false);
    }

    // Clean up
    return () => {
      isMounted = false;
    };
  }, []);

  // Add event listener for storage changes to sync across tabs
  useEffect(() => {
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          // Token was removed in another tab
          setUser(null);
          delete api.defaults.headers.common['Authorization'];
        } else if (e.newValue && !user) {
          // Token was added in another tab
          try {
            api.defaults.headers.common['Authorization'] = `Bearer ${e.newValue}`;
            const response = await api.get<{ user: User }>('/auth/me');
            if (response.data?.user) {
              setUser(response.data.user);
            }
          } catch (error) {
            console.error('Failed to sync user from storage:', error);
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Make the login request
      const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { email, password });
      
      if (!response.data?.success || !response.data.data) {
        throw new Error(response.data?.message || 'Login failed. Please try again.');
      }
      
      const { token, user } = response.data.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server: Missing token or user data');
      }
      
      // Check if the user has the admin role
      if (user.role !== 'admin') {
        // Clear any partial data
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        throw new Error('Access denied. This application is for administrators only.');
      }
      
      // Store the token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set the token in axios headers for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update the user state
      setUser(user);
      
      // Force a re-render of protected routes
      router.refresh();
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      // Clear any partial state on error
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logout initiated');
    
    // Clear token from storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove axios header
    delete api.defaults.headers.common['Authorization'];
    
    // Reset user state
    setUser(null);
    
    console.log('Redirecting to login page...');
    
    // Force redirect to login page
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
