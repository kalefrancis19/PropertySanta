'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Calendar, 
  Settings,
  FileText,
  MessageCircle,
  BarChart3,
  LogOut,
  User,
  Bell,
  Sun,
  Moon,
  ShoppingCart,
  Loader2
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === 'undefined' || loading) return;
    
    // If there's no user and we're not on the login page, redirect to login
    if (!user) {
      console.log('No authenticated user, redirecting to login');
      router.push('/login');
    }
  }, [user, loading, router]);

  // Get the user's first name or default to 'User'
  const userName = user?.name?.split(' ')[0] || 'User';

  const handleSignOut = () => {
    logout();
    router.push('/login');
  };
  const [activeSection, setActiveSection] = useState(() => {
    if (pathname === '/') return 'overview';
    if (pathname === '/properties') return 'properties';
    if (pathname === '/tasks') return 'tasks';
    if (pathname === '/reports') return 'reports';
    if (pathname === '/messages') return 'messages';
    if (pathname === '/orders') return 'orders';
    if (pathname === '/settings') return 'settings';
    return 'overview';
  });

  const navigationItems = [
    { id: 'overview', name: 'Dashboard', icon: BarChart3, href: '/' },
    { id: 'properties', name: 'My Properties', icon: Home, href: '/properties' },
    { id: 'tasks', name: 'My Tasks', icon: Calendar, href: '/tasks' },
    { id: 'reports', name: 'Reports', icon: FileText, href: '/reports' },
    { id: 'messages', name: 'Messages', icon: MessageCircle, href: '/messages' },
    { id: 'orders', name: 'My Orders', icon: ShoppingCart, href: '/orders' },
    { id: 'settings', name: 'Settings', icon: Settings, href: '/settings' },
  ];

  // Show loading state while checking authentication
  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading your dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Customer Portal</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={handleSignOut}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 