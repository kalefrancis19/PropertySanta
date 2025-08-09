'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  List, 
  MessageCircle, 
  User, 
  Bell,
  Clock,
  MapPin,
  Calendar,
  Building,
  Play,
  CheckCircle,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../components/AuthProvider';
import { ProtectedRoute } from '../../components/ProtectedRoute';

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());
  const router = useRouter();
  const { authState } = useAuth();
  
  const user = authState.user;
  const userName = user?.name || 'Cleaner';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      router.push('/dashboard');
    } else if (tab === 'chat') {
      router.push('/chat');
    } else if (tab === 'profile') {
      router.push('/profile');
    }
  };

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const response = await apiService.getTasks();
        if (response.success) {
          setTasks(response.data);
        } else {
          setError(response.message || 'Failed to load tasks');
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
  
    // ✅ Only trigger when auth is loaded and user is authenticated
    if (!authState.isLoading && authState.isAuthenticated && authState.user) {
      loadTasks();
    }
  }, [authState.isLoading, authState.isAuthenticated, authState.user]);
  
  const groupTasksByProperty = (tasks: any[]) => {
    const grouped: { [key: string]: { property: any; tasks: any[] } } = {};
    
    // If tasks is an array of properties (from the modified backend response)
    if (tasks && tasks.length > 0 && tasks[0].name) {
      tasks.forEach(property => {
        const propertyKey = property?._id || property?.id || 'unknown';
        const propertyName = property?.name || 'Unknown Property';
        
        if (!grouped[propertyKey]) {
          grouped[propertyKey] = {
            property: {
              id: propertyKey,
              name: propertyName,
              address: property?.address || 'No address provided'
            },
            tasks: property.roomTasks || []
          };
        }
      });
      return grouped;
    }
    
    tasks.forEach(task => {
      const property = task.property || {};
      const propertyKey = property?._id || property?.id || 'unknown';
      const propertyName = property?.name || property?.propertyName || 'Unknown Property';
      
      if (!grouped[propertyKey]) {
        grouped[propertyKey] = {
          property: {
            id: propertyKey,
            name: propertyName,
            address: property?.address || task.address || 'Address not available',
            type: property?.type || 'apartment'
          },
          tasks: []
        };
      }
      grouped[propertyKey].tasks.push(task);
    });
    return grouped;
  };

  const groupedTasks = groupTasksByProperty(tasks);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-yellow-200';
      case 'in_progress': return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-200';
      case 'completed': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-200';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 dark:from-gray-900/30 dark:to-slate-900/30 dark:text-gray-200';
    }
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'apartment': return <Building className="w-4 h-4" />;
      case 'house': return <Home className="w-4 h-4" />;
      case 'office': return <Users className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case 'apartment': return 'text-blue-500';
      case 'house': return 'text-green-500';
      case 'office': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const formatEstimatedTime = (timeStr: string): string => {
    if (!timeStr) return 'Not specified';
    
    // Try to match the time value and unit
    const match = timeStr.match(/^(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|hrs?|days?|d)?$/i);
    
    if (!match) return timeStr; // Return as is if format doesn't match
    
    const value = parseFloat(match[1]);
    const unit = match[2]?.toLowerCase() || '';
    
    // Convert everything to minutes for comparison
    let totalMinutes = 0;
    
    if (unit.includes('day') || unit === 'd') {
      totalMinutes = value * 24 * 60;
    } else if (unit.includes('hour') || unit === 'hr' || unit === 'h') {
      totalMinutes = value * 60;
    } else {
      totalMinutes = value; // Assume minutes if no unit specified
    }
    
    // Format the output
    if (totalMinutes >= 24 * 60) {
      const days = Math.floor(totalMinutes / (24 * 60));
      const remainingHours = Math.round((totalMinutes % (24 * 60)) / 60);
      return `${days} day${days > 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours} hr${remainingHours > 1 ? 's' : ''}` : ''}`.trim();
    } else if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const remainingMinutes = Math.round(totalMinutes % 60);
      return `${hours} hr${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} min${remainingMinutes > 1 ? 's' : ''}` : ''}`.trim();
    } else {
      return `${Math.round(totalMinutes)} min${totalMinutes !== 1 ? 's' : ''}`;
    }
  };
  
  const sumEstimatedTimes = (tasks: any[]): string => {
    if (!tasks || tasks.length === 0) return 'Not specified';
    
    const totalMinutes = tasks.reduce((total, task) => {
      if (!task.estimatedTime) return total;
      
      const match = task.estimatedTime.match(/^(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|hrs?|days?|d)?$/i);
      if (!match) return total;
      
      const value = parseFloat(match[1]);
      const unit = match[2]?.toLowerCase() || '';
      
      if (unit.includes('day') || unit === 'd') return total + (value * 24 * 60);
      if (unit.includes('hour') || unit === 'hr' || unit === 'h') return total + (value * 60);
      return total + value; // Default to minutes
    }, 0);
    
    // Format the total time
    if (totalMinutes >= 24 * 60) {
      const days = Math.floor(totalMinutes / (24 * 60));
      const remainingHours = Math.round((totalMinutes % (24 * 60)) / 60);
      return `${days} day${days > 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours} hr${remainingHours > 1 ? 's' : ''}` : ''}`.trim();
    } else if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const remainingMinutes = Math.round(totalMinutes % 60);
      return `${hours} hr${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} min${remainingMinutes > 1 ? 's' : ''}` : ''}`.trim();
    } else {
      return `${Math.round(totalMinutes)} min${totalMinutes !== 1 ? 's' : ''}`;
    }
  };

  const getPropertyStats = (propertyTasks: any[]) => {
    const totalTasks = propertyTasks.length;
    const completedTasks = propertyTasks.filter(task => task.isCompleted === true).length;
    
    return {
      total: totalTasks,
      completed: completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  const formatScheduledTime = (timeStr: string) => {
    if (!timeStr) return 'Not scheduled';
    
    try {
      const scheduledDate = new Date(timeStr);
      const now = new Date();
      const timeDiff = scheduledDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff < 0) {
        return 'Overdue';
      } else if (hoursDiff < 24) {
        return `Today at ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else if (hoursDiff < 48) {
        return `Tomorrow at ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        return scheduledDate.toLocaleDateString([], { 
          year: 'numeric',
          month: 'short', 
          day: 'numeric',
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const togglePropertyExpanded = (propertyKey: string) => {
    setExpandedProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyKey)) {
        newSet.delete(propertyKey);
      } else {
        newSet.add(propertyKey);
      }
      return newSet;
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col pt-24">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-6 py-6 shadow-lg border-b border-white/20 z-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tasks
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              Welcome back, {userName} 👋
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="relative p-3 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
            </button>
            <button 
              onClick={() => router.push('/profile')}
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <span className="text-white font-semibold text-lg">{userInitial}</span>
            </button>
          </div>
        </div>
      </div>

        {/* Properties Overview */}
        <div className="px-6 pt-12 pb-32">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Properties Overview</h3>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTasks).map(([propertyKey, propertyData]) => {
                const { property, tasks: propertyTasks } = propertyData;
                const stats = getPropertyStats(propertyTasks);
                const hasInProgressTasks = propertyTasks.some(task => task.status === 'in_progress');
                const hasPendingTasks = propertyTasks.some(task => task.status === 'pending');
                
                return (
                  <div key={propertyKey} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`p-2 rounded-xl ${getPropertyTypeColor(property.type)} bg-opacity-10`}>
                              {getPropertyTypeIcon(property.type)}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {property.name}
          
                              </h3>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span>{property.address}</span>
                          </div>
                          {property.scheduledTime && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mt-1">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span>
                                {new Date(property.scheduledTime).toLocaleString([], {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Property Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Total Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{stats.completed}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">Completed</div>
                        </div>
                      </div>

                      {/* Property Action Button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {stats.completed === stats.total ? (
                            <button className="flex items-center space-x-2 bg-gray-400 text-white px-6 py-3 rounded-2xl shadow-lg cursor-not-allowed">
                              <CheckCircle className="w-4 h-4" />
                              <span className="font-semibold">Completed</span>
                            </button>
                          ) : stats.completed === 0 ? (
                            <button 
                              onClick={() => router.push(`/chat?propertyId=${property.id}&propertyName=${encodeURIComponent(property.name)}`)}
                              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                            >
                              <Play className="w-4 h-4" />
                              <span className="font-semibold">Start Property</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => router.push(`/chat?propertyId=${property.id}&propertyName=${encodeURIComponent(property.name)}`)}
                              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                            >
                              <Play className="w-4 h-4" />
                              <span className="font-semibold">Continue</span>
                            </button>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-300">Estimated Time</p>
                          <p className="font-bold text-gray-900 dark:text-white text-lg">
                            {property.estimatedTime ? formatEstimatedTime(property.estimatedTime) : sumEstimatedTimes(propertyTasks)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>



        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-t border-white/20 px-6 py-4 z-50">
          <div className="flex items-center justify-around">
            <button 
              onClick={() => handleTabChange('dashboard')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-200 ${
                activeTab === 'dashboard' 
                  ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' 
                  : 'text-gray-400 hover:text-blue-500'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">Dashboard</span>
            </button>
            <button 
              onClick={() => handleTabChange('tasks')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-200 ${
                activeTab === 'tasks' 
                  ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' 
                  : 'text-gray-400 hover:text-blue-500'
              }`}
            >
              <List className="w-6 h-6" />
              <span className="text-xs font-medium">Tasks</span>
            </button>
            <button 
              onClick={() => handleTabChange('chat')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-200 ${
                activeTab === 'chat' 
                  ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' 
                  : 'text-gray-400 hover:text-blue-500'
              }`}
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs font-medium">Chat</span>
            </button>
            <button 
              onClick={() => handleTabChange('profile')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-200 ${
                activeTab === 'profile' 
                  ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' 
                  : 'text-gray-400 hover:text-blue-500'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
