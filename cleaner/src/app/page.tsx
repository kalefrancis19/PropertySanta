'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Smartphone, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../components/AuthProvider';
import { apiService } from '../services/apiService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success'>('error');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpRequested, setOtpRequested] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  
  const router = useRouter();
  const { authState, login, loginWithOTP } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    console.log('Login page: Auth state changed:', authState);
    if (authState.isAuthenticated && !redirecting) {
      console.log('Login page: User is authenticated, redirecting to dashboard...');
      setRedirecting(true);
      // Add delay to allow success message to be visible
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000); // 2 second delay
    }
  }, [authState.isAuthenticated, router, redirecting]);

  const showToastMessage = (message: string, type: 'error' | 'success' = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    // Extend duration for success messages to ensure visibility
    const duration = type === 'success' ? 6000 : 4000;
    setTimeout(() => setShowToast(false), duration);
  };

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    setOtpError('');
    
    let hasError = false;
    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    }
    
    if (loginMethod === 'password' && !password) {
      setPasswordError('Password is required');
      hasError = true;
    }
    
    if (loginMethod === 'otp' && !otp) {
      setOtpError('OTP is required');
      hasError = true;
    }
    
    if (hasError) {
      showToastMessage('Please fill in all required fields.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting login process...');
      console.log('Auth state before login:', authState);
      
      let loginResult;
      if (loginMethod === 'password') {
        console.log('Attempting password login...');
        loginResult = await login({ email, password });
      } else {
        console.log('Attempting OTP login...');
        loginResult = await loginWithOTP({ email, otp });
      }
      
      console.log('Login successful, result:', loginResult);
      console.log('Auth state after login:', authState);
      showToastMessage('🎉 Login successful! Redirecting to dashboard...', 'success');
      
      // Don't redirect here - let the useEffect handle it when auth state updates
      console.log('Login completed, waiting for auth state update...');
      
      // Update success message after a short delay to show redirecting
      setTimeout(() => {
        if (redirecting) {
          setToastMessage('🎉 Login successful! Redirecting to dashboard...');
        }
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      showToastMessage(error instanceof Error ? error.message : 'Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!email) {
      setEmailError('Email is required');
      showToastMessage('Please enter your email first.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.requestOTP({ email });
      
      if (response.success) {
        setOtpRequested(true);
        showToastMessage('OTP sent to your email!', 'success');
      } else {
        showToastMessage(response.message || 'Failed to send OTP. Please try again.', 'error');
      }
    } catch (error) {
      showToastMessage('Failed to send OTP. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 relative z-10">
        <div className="text-center mb-5 animate-fade-in">
          {/* Logo */}
          <div className="relative">
            <div className="w-48 h-48 mx-auto">
              <Image 
                src="/logo.png" 
                alt="PropertySanta Logo" 
                width={200}
                height={200}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Property Cleaner
          </h1>
   
        </div>

        {/* Login Form */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/10 border border-white/20 animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Welcome Back
          </h2>

          {/* Email Input */}
          <div className="mb-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 ${
                  emailError 
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-blue-500'
                } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
              />
            </div>
            {emailError && (
              <p className="text-red-500 text-sm mt-2 ml-1">{emailError}</p>
            )}
          </div>

          {/* Password/OTP Input */}
          {loginMethod === 'password' ? (
            <div className="mb-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 ${
                    passwordError 
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-blue-500'
                  } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mt-2 ml-1">{passwordError}</p>
              )}
            </div>
          ) : (
            <div className="mb-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Smartphone className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 ${
                    otpError 
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:border-blue-500'
                  } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                />
              </div>
              {otpError && (
                <p className="text-red-500 text-sm mt-2 ml-1">{otpError}</p>
              )}
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-2xl mb-6 transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center group"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* OTP Request Button */}
          {loginMethod === 'otp' && !otpRequested && (
            <button
              onClick={handleRequestOTP}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-2xl mb-6 transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-md"
            >
              Request OTP
            </button>
          )}

          {/* Switch Login Method */}
          <div className="text-center">
            <button
              onClick={() => {
                setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
                setOtpRequested(false);
                setOtp('');
              }}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              {loginMethod === 'password' ? 'Login with OTP' : 'Login with Password'}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-4">
            <Link 
              href="/signup" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Don't have an account? Sign Up
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Need help? <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Contact support</span>
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-6 left-6 right-6 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border transform transition-all duration-300 ${
          toastType === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400 animate-pulse' 
            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400'
        } z-50`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {toastType === 'success' && (
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
              )}
              <span className="font-medium">{toastMessage}</span>
            </div>
            <button 
              onClick={() => setShowToast(false)}
              className="ml-4 text-white/80 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 