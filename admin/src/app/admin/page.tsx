'use client';

import { useState } from 'react';
import { 
  Users, 
  Shield, 
  Activity, 
  Camera, 
  FileText, 
  Bell, 
  BarChart3,
  Settings,
  LogOut,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Star,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'ai_reviewer';
  lastLogin: string;
  status: 'active' | 'inactive';
}

interface Cleaner {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'busy' | 'offline';
  currentTask: string | null;
  rating: number;
  tasksCompleted: number;
  lastActive: string;
}

interface Task {
  id: string;
  property: string;
  cleaner: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  scheduledTime: string;
  estimatedDuration: string;
  photos: number;
  aiIssues: string[];
  priority: 'low' | 'medium' | 'high';
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { theme, toggleTheme } = useTheme();

  // Mock data
  const adminUsers: AdminUser[] = [
    { id: '1', name: 'Admin Manager', email: 'admin@property.com', role: 'admin', lastLogin: '2024-04-20 10:30 AM', status: 'active' },
    { id: '2', name: 'Sarah Supervisor', email: 'sarah@property.com', role: 'supervisor', lastLogin: '2024-04-20 09:15 AM', status: 'active' },
    { id: '3', name: 'AI Reviewer', email: 'ai@property.com', role: 'ai_reviewer', lastLogin: '2024-04-20 08:45 AM', status: 'active' }
  ];

  const cleaners: Cleaner[] = [
    { id: '1', name: 'Logan T.', email: 'logan@cleaner.com', phone: '+1 (555) 123-4567', status: 'busy', currentTask: '123 Main St', rating: 4.8, tasksCompleted: 45, lastActive: '2 min ago' },
    { id: '2', name: 'Sarah M.', email: 'sarah@cleaner.com', phone: '+1 (555) 234-5678', status: 'active', currentTask: null, rating: 4.9, tasksCompleted: 52, lastActive: '5 min ago' },
    { id: '3', name: 'Mike R.', email: 'mike@cleaner.com', phone: '+1 (555) 345-6789', status: 'offline', currentTask: null, rating: 4.6, tasksCompleted: 38, lastActive: '1 hour ago' }
  ];

  const tasks: Task[] = [
    { id: '1', property: '123 Main St', cleaner: 'Logan T.', status: 'in_progress', scheduledTime: '10:00 AM', estimatedDuration: '2.5 hours', photos: 8, aiIssues: ['Minor stain detected', 'Dust on ceiling fan'], priority: 'medium' },
    { id: '2', property: '456 Beach Blvd', cleaner: 'Sarah M.', status: 'pending', scheduledTime: '2:00 PM', estimatedDuration: '2.0 hours', photos: 0, aiIssues: [], priority: 'low' },
    { id: '3', property: '789 Oak Ave', cleaner: 'Mike R.', status: 'delayed', scheduledTime: '9:00 AM', estimatedDuration: '3.0 hours', photos: 0, aiIssues: [], priority: 'high' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'cleaners', name: 'Cleaner Management', icon: Users },
    { id: 'tasks', name: 'Task Dashboard', icon: CheckCircle },
    { id: 'ai', name: 'AI Integration', icon: Eye },
    { id: 'reports', name: 'Reports & Logs', icon: FileText },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
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
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin Manager</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{cleaners.length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Active Cleaners</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                        <Activity className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.filter(t => t.status === 'in_progress').length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.filter(t => t.status === 'delayed').length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Delayed</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Task completed at 123 Main St</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Logan T. • 2 minutes ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">AI detected issue in kitchen</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Sarah M. • 15 minutes ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">New task assigned to Mike R.</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Admin Manager • 1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cleaners' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cleaner Management</h2>
                  <button className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-primary-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
                    Add Cleaner
                  </button>
                </div>
                
                <div className="space-y-4">
                  {cleaners.map((cleaner) => (
                    <div key={cleaner.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{cleaner.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{cleaner.email}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">{cleaner.phone}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              cleaner.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                              cleaner.status === 'busy' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                              'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                            }`}>
                              {cleaner.status}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{cleaner.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{cleaner.tasksCompleted} tasks completed</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">Last active: {cleaner.lastActive}</p>
                          {cleaner.currentTask && (
                            <p className="text-xs text-primary-600 dark:text-primary-400">Currently at: {cleaner.currentTask}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Dashboard</h2>
                    <div className="flex space-x-2">
                      <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        <option>All Properties</option>
                        <option>123 Main St</option>
                        <option>456 Beach Blvd</option>
                      </select>
                      <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        <option>All Status</option>
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{task.property}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Cleaner: {task.cleaner}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">Scheduled: {task.scheduledTime}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                task.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                                task.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                                task.status === 'delayed' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                              }`}>
                                {task.status.replace('_', ' ')}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                task.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                                task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                                'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Duration: {task.estimatedDuration}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">{task.photos} photos</p>
                            {task.aiIssues.length > 0 && (
                              <p className="text-xs text-red-600 dark:text-red-400">{task.aiIssues.length} AI issues</p>
                            )}
                          </div>
                        </div>
                        
                        {task.aiIssues.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AI Detected Issues:</p>
                            <div className="space-y-1">
                              {task.aiIssues.map((issue, index) => (
                                <div key={index} className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                                  <AlertTriangle className="h-4 w-4" />
                                  <span>{issue}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">AI Integration Panel</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* AI Detected Issues */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Detected Issues</h3>
                    <div className="space-y-3">
                      <div className="p-4 border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Minor stain detected</span>
                          <div className="flex space-x-2">
                            <button className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors">Accept</button>
                            <button className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 transition-colors">Reject</button>
                          </div>
                        </div>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">Property: 123 Main St • Cleaner: Logan T.</p>
                      </div>
                      
                      <div className="p-4 border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Dust on ceiling fan</span>
                          <div className="flex space-x-2">
                            <button className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 transition-colors">Accept</button>
                            <button className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 transition-colors">Reject</button>
                          </div>
                        </div>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">Property: 123 Main St • Cleaner: Logan T.</p>
                      </div>
                    </div>
                  </div>

                  {/* Photo Gallery */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Photo Gallery & Comparison</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Before</span>
                      </div>
                      <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">After</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button className="w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-primary-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
                        View All Photos
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Logs</h2>
                  <div className="flex space-x-2">
                    <button className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-primary-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
                      Generate PDF
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 transform hover:scale-105">
                      Export CSV
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Cleaning Report</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">April 15-21, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">15 tasks completed</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Generated 2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cleaner Performance Report</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">March 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">3 cleaners analyzed</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Generated 1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analytics & Insights</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cleaning Trends</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Average completion time</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">2.3 hours</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Tasks completed this week</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">15</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Average rating</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">4.7/5</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Common Issues by Property</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">123 Main St</p>
                        <p className="text-xs text-red-600 dark:text-red-400">Dust accumulation, carpet stains</p>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">456 Beach Blvd</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">Kitchen counter stains</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Management</h3>
                    <div className="space-y-3">
                      {adminUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Role: {user.role.replace('_', ' ')}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              user.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                            }`}>
                              {user.status}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Last login: {user.lastLogin}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 