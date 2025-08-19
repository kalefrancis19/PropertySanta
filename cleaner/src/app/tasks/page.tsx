'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  List, 
  MessageCircle, 
  User, 
  Bell,
  MapPin,
  Calendar,
  Building,
  Play,
  CheckCircle,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../components/AuthProvider';
import { ProtectedRoute } from '../../components/ProtectedRoute';

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [propertyDetails, setPropertyDetails] = useState<{[key: string]: any}>({});
  const loadedProperties = useRef<Set<string>>(new Set());
  const router = useRouter();
  const { authState } = useAuth();
  
  const user = authState.user;
  const userName = user?.name || 'Cleaner';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleTabChange = async (tab: string) => {
    // Don't do anything if clicking the current tab
    if (tab === activeTab) return;
    
    setActiveTab(tab);
    
    if (tab === 'dashboard') {
      router.push('/dashboard');
    } else if (tab === 'chat') {
      router.push('/chat');
    } else if (tab === 'profile') {
      router.push('/profile');
    } else if (tab === 'tasks') {
      try {
        // Clear existing data
        setTasks([]);
        setPropertyDetails({});
        loadedProperties.current = new Set();
        setLoading(true);
        
        // Make a fresh request to the server
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
    }
  };

  // Load tasks
  useEffect(() => {
    let isMounted = true;
    
    const loadTasks = async () => {
      if (!authState.isAuthenticated || !authState.user) return;
      
      try {
        setLoading(true);
        setError('');
        
        const response = await apiService.getTasks();
        
        if (!isMounted) return;
        
        if (response?.success) {
          setTasks(response.data || []);
        } else {
          setError(response?.message || 'Failed to load tasks');
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        if (isMounted) {
          setError('Failed to load tasks. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadTasks();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [authState.isAuthenticated, authState.user?.id]);

  // Fetch property details for each task
  useEffect(() => {
    if (!tasks.length) return;

    const propertyIds = Array.from(new Set(tasks.map(task => task.propertyId).filter(Boolean)));
    const propertyIdsToFetch = propertyIds.filter(id => !loadedProperties.current.has(id));
    if (propertyIdsToFetch.length === 0) return;

    propertyIdsToFetch.forEach(id => loadedProperties.current.add(id));
    let isMounted = true;

    const fetchPropertyDetails = async () => {
      try {
        const fetchPromises = propertyIdsToFetch.map(propertyId =>
          apiService.getPropertyDetails(propertyId)
            .then(response => ({
              id: propertyId,
              response,
              success: response?.success || false
            }))
            .catch(error => {
              console.error(`Error fetching property ${propertyId}:`, error);
              return { id: propertyId, response: null, success: false };
            })
        );

        const results = await Promise.all(fetchPromises);

        if (!isMounted) return;

        // Save property objects into global state
        setPropertyDetails(prev => {
          const updated = { ...prev };
          results.forEach(r => {
            if (r.success && r.response?.property) {
              updated[r.id] = r.response.property; // store property object
            }
          });
          return updated;
        });

      } catch (error) {
        console.error('Error in property details fetch:', error);
      }
    };

    fetchPropertyDetails();
    return () => {
      isMounted = false;
    };
  }, [tasks]);

  // Check if we're still loading tasks or if we have tasks with pending property details
  const arePropertiesLoading = loading || 
    (tasks.length > 0 && tasks.some(task => 
      task.propertyId && !propertyDetails[task.propertyId]
    ));

  const getTaskStats = (requirements: any[]) => {
    const totalTasks = requirements.length;
    const completedTasks = requirements.filter(requirement => requirement.isCompleted === true).length;
    return {
      total: totalTasks,
      completed: completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
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
              Welcome back, {userName} 
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
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Overview my tasks</h3>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : arePropertiesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading property details...</p>
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
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <List className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No tasks found</h3>
              <p className="text-gray-500 dark:text-gray-400">You don't have any tasks assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
            {tasks.map((task) => {
              const stats = getTaskStats(task.requirements);

              return (
                <div key={task._id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`text-xl font-semibold leading-none tracking-tight py-3`}>
                          Task #{task._id.slice(-6).toUpperCase()}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                         <div className={`rounded-xl ${getPropertyTypeColor(propertyDetails[task.propertyId]?.type)} bg-opacity-10`}>
                            {getPropertyTypeIcon(propertyDetails[task.propertyId]?.type)}
                          </div>
                          <div>
                              {propertyDetails[task.propertyId]?.name || `Property ${task.propertyId?.substring(0, 8) || 'Unknown'}`}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span>{propertyDetails[task.propertyId]?.address || 'No address provided'}</span>
                        </div>
                        {task.scheduledTime && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mt-1">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>
                              {new Date(task.scheduledTime).toLocaleString([], {
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
                    
                    {/* Task Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">Total Rooms</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{stats.completed}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">Completed</div>
                      </div>
                    </div>
          
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {stats.completed === stats.total ? (
                          <button className="flex items-center space-x-2 bg-gray-400 text-white px-6 py-3 rounded-2xl shadow-lg cursor-not-allowed">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-semibold">Completed</span>
                          </button>
                        ) : stats.completed === 0 ? (
                          <button 
                            onClick={() => router.push(`/chat?propertyId=${task.propertyId}&propertyName=${encodeURIComponent(propertyDetails[task.propertyId]?.name || '')}`)}
                            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                          >
                            <Play className="w-4 h-4" />
                            <span className="font-semibold">Start Property</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => router.push(`/chat?propertyId=${task.propertyId}&propertyName=${encodeURIComponent(propertyDetails[task.propertyId]?.name || '')}`)}
                            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                          >
                            <Play className="w-4 h-4" />
                            <span className="font-semibold">Continue</span>
                          </button>
                        )}
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
            {/* <button 
              onClick={() => handleTabChange('chat')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-200 ${
                activeTab === 'chat' 
                  ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' 
                  : 'text-gray-400 hover:text-blue-500'
              }`}
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs font-medium">Chat</span>
            </button> */}
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
