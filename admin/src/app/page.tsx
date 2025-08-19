'use client';

import { useState, useEffect } from 'react';
import { 
  Home, 
  Menu, 
  Moon, 
  Sun, 
  CheckCircle, 
  FileText,
  Activity,
  Clock,
  Users,
  User as UserIcon,
  Building
} from 'lucide-react';
import { taskAPI, Task, propertyAPI, Property, userAPI, User } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all data in parallel
      const [tasksData, propertiesData, usersData] = await Promise.all([
        taskAPI.getAll(),
        propertyAPI.getAll(),
        userAPI.getAll()
      ]);
      
      console.log('Fetched tasks:', tasksData);
      console.log('Fetched properties:', propertiesData);
      console.log('Fetched users:', usersData);
      
      setTasks(tasksData);
      setProperties(propertiesData);
      setUsers(usersData);
      
      // Log task completion status
      tasksData.forEach((task, index) => {
        const totalTasks = task.requirements.reduce((count, req) => {
          return count + req.tasks.length;
        }, 0);
        const completedTasks = task.requirements.reduce((count, req) => {
          return count + req.tasks.filter(task => task.isCompleted).length;
        }, 0);
        console.log(`Task ${index + 1} (${task._id}): ${completedTasks}/${totalTasks} tasks completed`);
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Log the raw task data first
  console.log('\n=== RAW TASKS DATA ===');
  console.log(JSON.stringify(tasks, null, 2));
  
  // Calculate total tasks (count of task objects, not individual task items)
  const totalTasks = tasks.length;

  // Calculate completed tasks (tasks where all requirements are completed)
  const completedTasks = tasks.filter(task => {
    const totalRequirements = task.requirements.length;
    const completedRequirements = task.requirements.filter(req => req.isCompleted).length;
    
    // Task is completed if all requirements are completed
    return totalRequirements > 0 && completedRequirements === totalRequirements;
  }).length;

  // Calculate pending tasks (tasks where no requirements are completed)
  const pendingTasks = tasks.filter(task => {
    const completedRequirements = task.requirements.filter(req => req.isCompleted).length;
    
    // Task is pending if no requirements are completed
    return completedRequirements === 0;
  }).length;

  // Calculate in progress tasks (tasks where some but not all requirements are completed)
  const inProgressTasks = tasks.filter(task => {
    const totalRequirements = task.requirements.length;
    const completedRequirements = task.requirements.filter(req => req.isCompleted).length;
    
    // Task is in progress if some requirements are completed but not all
    return completedRequirements > 0 && completedRequirements < totalRequirements;
  }).length;

  // Calculate additional stats
  const totalProperties = properties.length;
  const totalUsers = users.length;
  const totalCustomers = users.filter(user => user.role === 'customer').length;
  const totalCleaners = users.filter(user => user.role === 'cleaner').length;

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Overview of cleaning progress and schedules</p>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTasks}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingTasks}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {inProgressTasks}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedTasks}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProperties}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                  <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Customers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCustomers}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cleaners</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCleaners}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            
          </div>        
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 