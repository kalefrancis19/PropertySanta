import { apiService } from './apiService';
import { AuthState } from '../types';

class AuthService {
  async signUp(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthState> {
    try {
      const response = await apiService.signUp(userData);
      
      if (!response.success) {
        return {
          isAuthenticated: false,
          user: null,
          token: null,
          error: response.message || 'Sign up failed'
        };
      }

      const { user, token } = response.data;
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }

      return {
        isAuthenticated: true,
        user,
        token,
        error: undefined
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        isAuthenticated: false,
        user: null,
        token: null,
        error: 'Sign up failed'
      };
    }
  }

  async loginWithPassword(credentials: {
    email: string;
    password: string;
  }): Promise<AuthState> {
    try {
      console.log('AuthService: Calling API service...');
      const response = await apiService.loginWithPassword(credentials);
      console.log('AuthService: API response:', response);
      
      if (!response.success) {
        console.log('AuthService: Login failed:', response.message);
        return {
          isAuthenticated: false,
          user: null,
          token: null,
          error: response.message || 'Login failed'
        };
      }

      const { user, token } = response.data;
      console.log('AuthService: Login successful, user:', user);
      console.log('AuthService: Token received:', token ? 'Yes' : 'No');
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        console.log('AuthService: Token stored in localStorage');
      }

      const authState = {
        isAuthenticated: true,
        user,
        token,
        error: undefined
      };
      
      console.log('AuthService: Returning auth state:', authState);
      return authState;
    } catch (error) {
      console.error('AuthService: Login error:', error);
      return {
        isAuthenticated: false,
        user: null,
        token: null,
        error: 'Login failed'
      };
    }
  }

  async loginWithOTP(credentials: {
    email: string;
    otp: string;
  }): Promise<AuthState> {
    try {
      const response = await apiService.loginWithOTP(credentials);
      
      if (!response.success) {
        return {
          isAuthenticated: false,
          user: null,
          token: null,
          error: response.message || 'OTP login failed'
        };
      }

      const { user, token } = response.data;
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }

      return {
        isAuthenticated: true,
        user,
        token,
        error: undefined
      };
    } catch (error) {
      console.error('OTP login error:', error);
      return {
        isAuthenticated: false,
        user: null,
        token: null,
        error: 'OTP login failed'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('AuthService: Calling backend logout...');
      await apiService.logout();
      console.log('AuthService: Backend logout successful');
    } catch (error) {
      console.error('AuthService: Logout error:', error);
    } finally {
      // Clear token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        console.log('AuthService: Token cleared from localStorage');
      }
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const response = await apiService.refreshToken();
      
      if (response.success && response.data?.token) {
        const token = response.data.token;
        
        // Update token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        
        return token;
      }
      
      return null;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      const response = await apiService.getCurrentUser();
      
      if (response.success) {
        return response.data?.user;
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async validateAndRefreshToken(): Promise<boolean> {
    try {
      const token = this.getStoredToken();
      if (!token) return false;
      
      // Check if token is valid
      if (!this.isTokenValid(token)) {
        console.log('Token is invalid, attempting to refresh...');
        const newToken = await this.refreshToken();
        return !!newToken;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation and refresh error:', error);
      return false;
    }
  }

  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  isTokenValid(token: string): boolean {
    if (!token) return false;
    
    try {
      // Basic token validation - check if it's a JWT token format
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Check if it's a valid JWT structure
      const isValidFormat = token.length > 0 && /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token);
      
      if (!isValidFormat) return false;
      
      // Try to decode the JWT to check if it's expired
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is expired (with 5 minute buffer)
      if (payload.exp && payload.exp < (currentTime - 300)) {
        console.log('Token is expired');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
}

export const authService = new AuthService(); 