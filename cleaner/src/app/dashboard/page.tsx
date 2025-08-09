'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  List, 
  MessageCircle, 
  User, 
  Bell, 
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Square,
  Plus,
  TrendingUp,
  Zap,
  Building,
  Users,
  Bed,
  Bath,
  Ruler
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../components/AuthProvider';
import { ProtectedRoute } from '../../components/ProtectedRoute';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedUpcomingProperties, setExpandedUpcomingProperties] = useState<Set<string>>(new Set());
  const [currentProperties, setCurrentProperties] = useState<any[]>([]);
  const [expandedCurrentProperties, setExpandedCurrentProperties] = useState<Set<string>>(new Set());
  const router = useRouter();
  const { authState } = useAuth();
  
  // Get user information
  const user = authState.user;
  const userName = user?.name || 'Cleaner';
  const userInitial = userName.charAt(0).toUpperCase();
  
  // Debug logging
  console.log('Dashboard - Auth State:', authState);
  console.log('Dashboard - User:', user);
  console.log('Dashboard - User Name:', userName);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'chat') {
      router.push('/chat');
    } else if (tab === 'profile') {
      router.push('/profile');
    } else if (tab === 'tasks') {
      router.push('/tasks');
    }
  };

  // Force refresh user data when auth state changes
  useEffect(() => {
    console.log('Auth state changed:', authState);
    if (authState.isAuthenticated && authState.user) {
      console.log('User authenticated:', authState.user);
      // Force reload tasks for new user
      setTasks([]);
      setLoading(true);
    }
  }, [authState.isAuthenticated, authState.user]);

  // Load tasks from backend
  useEffect(() => {
    const loadTasks = async () => {
      try {
        console.log('Loading tasks...');
        const response = await apiService.getTasks();
        console.log('Tasks response:', response);
        if (response.success) {
          const allTasks = response.data || [];
          setTasks(allTasks);

          const grouped = groupTasksByProperty(allTasks);
          const currentPropertyEntries = Object.values(grouped).filter(group => {
            const allSubTasks = group.tasks.flatMap(t => t.roomTasks?.flatMap(rt => rt.tasks) || []);
            const completedSubTasks = allSubTasks.filter(st => st.isCompleted).length;
            return completedSubTasks > 0 && completedSubTasks < allSubTasks.length;
          });

          setCurrentProperties(currentPropertyEntries);

          console.log('Tasks loaded:', allTasks);
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

    // Only load tasks if user is authenticated
    if (authState.isAuthenticated && authState.user) {
      loadTasks();
    }
  }, [authState.isAuthenticated, authState.user]);

  // Group tasks by property with property details
  const groupTasksByProperty = (tasks: any[]) => {
    const grouped: { [key: string]: { property: any; tasks: any[] } } = {};
    tasks.forEach(task => {
      const property = task.property;
      const propertyKey = property?._id || property?.id || 'unknown';
      const propertyName = property?.name || 'Unknown Property';
      
      if (!grouped[propertyKey]) {
        grouped[propertyKey] = {
          property: {
            id: propertyKey,
            name: propertyName,
            address: property?.address || task.address || 'Address not available',
            type: property?.type || 'apartment',
            squareFootage: property?.squareFootage || 0,
            instructions: property?.manual?.content || '',
            roomTasks: property?.roomTasks || []
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get upcoming cleanings grouped by property (next 24 hours)
  const getUpcomingCleaningsByProperty = (tasks: any[]) => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const upcomingTasks = tasks.filter(task => {
      if (!task.scheduledTime) return false;
      const scheduledTime = new Date(task.scheduledTime);
      return scheduledTime >= now && scheduledTime <= tomorrow;
    });

    // Group by property
    const groupedByProperty: { [key: string]: { property: any; tasks: any[] } } = {};
    upcomingTasks.forEach(task => {
      const property = task.property;
      const propertyKey = property?._id || property?.id || 'unknown';
      const propertyName = property?.name || 'Unknown Property';
      
      if (!groupedByProperty[propertyKey]) {
        groupedByProperty[propertyKey] = {
          property: {
            id: propertyKey,
            name: propertyName,
            address: property?.address || task.address || 'Address not available',
            type: property?.type || 'apartment'
          },
          tasks: []
        };
      }
      groupedByProperty[propertyKey].tasks.push(task);
    });

    // Sort properties by earliest task time
    return Object.entries(groupedByProperty).sort(([, a], [, b]) => {
      const earliestA = Math.min(...a.tasks.map(task => new Date(task.scheduledTime).getTime()));
      const earliestB = Math.min(...b.tasks.map(task => new Date(task.scheduledTime).getTime()));
      return earliestA - earliestB;
    });
  };

  // Calculate property statistics
  const getPropertyStats = (propertyTasks: any[]) => {
    const totalTasks = propertyTasks.length;
    const completedTasks = propertyTasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = propertyTasks.filter(task => task.status === 'in_progress').length;
    const pendingTasks = propertyTasks.filter(task => task.status === 'pending').length;
    
    return {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      pending: pendingTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  const toggleUpcomingProperty = (propertyKey: string) => {
    setExpandedUpcomingProperties(prev => {
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
      <div 
        key={`dashboard-${user?._id || 'no-user'}`}
        className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col pt-24"
      >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-6 py-6 shadow-lg border-b border-white/20 z-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
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

      {/* Stats Cards */}
      <div className="px-6 pt-12 pb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Properties</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{Object.keys(groupedTasks).length}</p>
                <p className="text-green-500 text-xs font-medium">Active properties</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-200 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
                <p className="text-blue-500 text-xs font-medium">Across all properties</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <List className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Properties */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-blue-200/30 dark:border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Current Properties</h3>
            {currentProperties.length > 0 && (
              <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                {currentProperties.length} In Progress
              </span>
            )}
          </div>
          {currentProperties.length > 0 ? (
            <div className="space-y-4">
              {currentProperties.map((propertyEntry, index) => {
                const property = propertyEntry.property;
                const tasks = propertyEntry.tasks;
                const propertyId = property.id;
                const isExpanded = expandedCurrentProperties.has(propertyId);
                
                // Calculate progress
                const allSubTasks = tasks.flatMap(t => t.roomTasks?.flatMap(rt => rt.tasks) || []);
                const completedSubTasks = allSubTasks.filter(st => st.isCompleted).length;
                const totalSubTasks = allSubTasks.length;
                const progressPercentage = totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0;
                
                return (
                  <div key={propertyId} className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-md hover:shadow-lg transition-all duration-200">
                    <div className="cursor-pointer" onClick={() => {
                      const newExpanded = new Set(expandedCurrentProperties);
                      if (isExpanded) {
                        newExpanded.delete(propertyId);
                      } else {
                        newExpanded.add(propertyId);
                      }
                      setExpandedCurrentProperties(newExpanded);
                    }}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                          {property.name || 'Unknown Property'}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {progressPercentage}% Complete
                          </span>
                          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {property.address || 'Address not available'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`flex items-center space-x-1 ${getPropertyTypeColor(property.type)}`}>
                            {getPropertyTypeIcon(property.type)}
                            <span className="text-xs font-medium capitalize">{property.type}</span>
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {completedSubTasks}/{totalSubTasks} tasks done
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                            <Play className="w-3 h-3" />
                            <span>Continue</span>
                          </button>
                          <button className="flex items-center space-x-1 bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-xl text-xs shadow-sm hover:shadow-md transition-all duration-200">
                            <Pause className="w-3 h-3" />
                            <span>Pause</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="space-y-2 mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 animate-slide-down">
                        {tasks.map((task, taskIndex) => {
                          const roomTasks = task.roomTasks || [];
                          return (
                            <div key={task._id || task.id || taskIndex} className="bg-gray-50/80 dark:bg-gray-900/50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                  {task.title || task.roomType || 'Room Task'}
                                </h6>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(task.status)}`}>
                                  {task.status?.replace('_', ' ') || 'pending'}
                                </span>
                              </div>
                              {roomTasks.length > 0 && (
                                <div className="space-y-1 ml-2">
                                  {roomTasks.map((roomTask, roomIndex) => (
                                    <div key={roomIndex} className="flex items-center justify-between text-xs">
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {roomTask.roomType} - {roomTask.tasks?.length || 0} subtasks
                                      </span>
                                      <span className="text-gray-500 dark:text-gray-500">
                                        {roomTask.tasks?.filter(t => t.isCompleted).length || 0}/{roomTask.tasks?.length || 0} done
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">No properties currently in progress</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Properties with at least one completed task will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Cleanings */}
      <div className="px-6 mb-6 animate-fade-in">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-blue-200">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Upcoming Cleanings
              </h3>
            </div>
            <div className="bg-white text-blue-700 px-3 py-1 rounded-full text-xs font-medium shadow-md text-center border-2 border-gradient-to-r from-blue-400 to-purple-500">
              Next 24 Hours
            </div>
          </div>
          {(() => {
            const upcomingCleaningsByProperty = getUpcomingCleaningsByProperty(tasks);
            return upcomingCleaningsByProperty.length > 0 ? (
              <div className="space-y-4">
                {upcomingCleaningsByProperty.map(([propertyKey, propertyData]) => {
                  const { property, tasks: propertyTasks } = propertyData;
                  const earliestTask = propertyTasks.sort((a, b) => 
                    new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
                  )[0];
                  
                  return (
                    <div key={propertyKey} className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] animate-slide-up">
                      <div 
                        className="flex items-center justify-between mb-3 cursor-pointer hover:bg-gray-50 rounded-lg p-3 transition-all duration-300"
                        onClick={() => toggleUpcomingProperty(propertyKey)}
                      >
                        <div className="flex-1">
                          <h2 className="font-bold text-blue-900 text-lg">
                            {property.name}
                          </h2>
                          <p className="text-xs text-gray-600 flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                            {property.address}
                          </p>
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 text-sm mt-2">
                            <div className={`${getPropertyTypeColor(property.type)} flex items-center space-x-1`}>
                              {getPropertyTypeIcon(property.type)}
                              <span>{property.type}</span>
                            </div>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <div className="flex items-center space-x-1">
                              <Ruler className="w-4 h-4" />
                              <span>{property.squareFootage} sqft</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex items-center space-x-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {propertyTasks.length} task{propertyTasks.length > 1 ? 's' : ''}
                          </span>
                          <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold transition-transform duration-300">
                            {expandedUpcomingProperties.has(propertyKey) ? '▼' : '▶'}
                          </div>
                        </div>
                      </div>
                      {expandedUpcomingProperties.has(propertyKey) && (
                        <div className="space-y-3 animate-slide-down">
                          {propertyTasks.map((task, index) => {
                            const scheduledTime = new Date(task.scheduledTime);
                            return (
                              <div key={task._id || task.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01]" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex-1">
                                    <h6 className="font-semibold text-gray-900 text-sm">
                                      {task.title}
                                    </h6>
                                  </div>
                                  <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                                      <Clock className="w-3 h-3 text-gray-600" />
                                      <span className="font-medium">{task.estimatedTime}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                                      <Calendar className="w-3 h-3 text-gray-600" />
                                      <span className="font-medium">{scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(task.status)}`}>
                                    {task.status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm">No upcoming cleanings in the next 24 hours</p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Bottom spacing to prevent content from being hidden by navigation */}
      <div className="h-32"></div>

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