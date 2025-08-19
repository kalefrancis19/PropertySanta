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
  Clock
} from 'lucide-react';
import { taskAPI, propertyAPI, Task, Property } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchData();
    }
  }, [authLoading, currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all tasks
      const tasksData = await taskAPI.getAll();
      
      // Fetch all properties
      const propertiesData = await propertyAPI.getAll();
      
      // Filter properties to only include those belonging to the current customer
      const customerProperties = propertiesData.filter((property: any) => {
        const customerId = typeof property.customer === 'string' 
          ? property.customer 
          : property.customer?._id;
        return customerId === currentUser?._id;
      });
      
      // Filter tasks to only include those for the customer's properties
      const customerTaskIds = customerProperties.map((property: Property) => property._id);
      const customerTasks = tasksData.filter(task => 
        customerTaskIds.includes(task.propertyId)
      );
      
      console.log('Fetched customer tasks:', customerTasks);
      console.log('Customer properties:', customerProperties);
      
      setTasks(customerTasks);
      setProperties(customerProperties);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Categorize tasks based on completion status
  const pendingTasks = tasks.filter(task => {
    // Task is pending if no requirements are completed
    const completedRequirements = task.requirements.filter(req => req.isCompleted).length;
    return completedRequirements === 0;
  });

  const inProgressTasks = tasks.filter(task => {
    // Task is in progress if some but not all requirements are completed
    const totalRequirements = task.requirements.length;
    const completedRequirements = task.requirements.filter(req => req.isCompleted).length;
    return completedRequirements > 0 && completedRequirements < totalRequirements;
  });

  const completedTasks = tasks.filter(task => {
    // Task is completed if all requirements are completed
    const totalRequirements = task.requirements.length;
    const completedRequirements = task.requirements.filter(req => req.isCompleted).length;
    return totalRequirements > 0 && completedRequirements === totalRequirements;
  });

  // Total number of tasks
  const totalTasks = tasks.length;

  if (loading || authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Overview of your cleaning tasks and progress</p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{properties.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <Home className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingTasks.length}</p>
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
                  {inProgressTasks.length}
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedTasks.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>        
      </div>
    </DashboardLayout>
  );
} 