'use client';

import { useState } from 'react';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Users, 
  Activity, 
  Eye as EyeIcon,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('admin');
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement actual admin login logic
    setTimeout(() => {
      setIsLoading(false);
      // For MVP, we'll simulate successful login
      window.location.href = '/admin';
    }, 1000);
  };

  const roles = [
    { id: 'admin', name: 'Administrator', description: 'Full system access and management', icon: Shield },
    { id: 'supervisor', name: 'Supervisor', description: 'Task oversight and cleaner management', icon: Users },
    { id: 'ai_reviewer', name: 'AI Reviewer', description: 'AI feedback review and validation', icon: EyeIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                PropertySanta Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </button>
              <div className="flex items-center space-x-4">
                <Activity className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Administrative Portal</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8">
          {/* Hero Section */}
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Admin Access
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              Secure administrative portal
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              PropertySanta management system
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Sign In
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access your admin dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Role
                </label>
                <div className="space-y-2">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <label
                        key={role.id}
                        className={`flex items-center space-x-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                          selectedRole === role.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.id}
                          checked={selectedRole === role.id}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="sr-only"
                        />
                        <Icon className={`h-5 w-5 ${
                          selectedRole === role.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{role.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{role.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter your admin email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      <span>Sign in to Admin Portal</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400">Need help?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <a href="/" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">
                  ← Back to Homeowner Portal
                </a>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Shield className="h-4 w-4" />
              <span>Secure administrative access</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 