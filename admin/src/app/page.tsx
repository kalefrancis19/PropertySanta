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
import { propertyAPI, Property } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Only fetch properties, not tasks
      const propertiesData = await propertyAPI.getAll();
      
      console.log('Fetched properties:', propertiesData);
      
      setProperties(propertiesData);
      
      // Log property task completion status
      propertiesData.forEach((property, index) => {
        const completed = property.roomTasks.reduce((count, roomTask) => {
          return count + roomTask.tasks.filter(task => task.isCompleted).length;
        }, 0);
        const total = property.roomTasks.reduce((count, roomTask) => {
          return count + roomTask.tasks.length;
        }, 0);
        console.log(`Property ${index + 1} (${property.name}): ${completed}/${total} tasks completed`);
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };



  // Log the raw property data first
  console.log('\n=== RAW PROPERTIES DATA ===');
  console.log(JSON.stringify(properties, null, 2));
  
  // Process properties (no status added, we'll categorize them directly)
  const processedProperties = [...properties];
  
  // Categorize properties based on room-level completion
  // 1. Not Started: No rooms are marked as completed
  // 2. In Progress: Some but not all rooms are completed
  // 3. Completed: All rooms are marked as completed
  
  const notStartedProperties = processedProperties.filter(property => {
    if (!property.isActive) return false;
    
    // Check if any room is marked as completed
    const hasCompletedRooms = property.roomTasks.some(room => 
      room.isCompleted
    );
    
    return !hasCompletedRooms;
  });
  
  const completedProperties = processedProperties.filter(property => {
    // Check if all rooms are marked as completed
    const allRoomsCompleted = property.roomTasks.length > 0 && 
      property.roomTasks.every(room => room.isCompleted);
    
    return allRoomsCompleted;
  });
  
  // In Progress properties have some but not all rooms completed
  const inProgressProperties = processedProperties.filter(property => {
    if (!property.isActive) return false;
    if (notStartedProperties.includes(property) || completedProperties.includes(property)) {
      return false;
    }
    
    const hasSomeCompletedRooms = property.roomTasks.some(room => room.isCompleted);
    
    return hasSomeCompletedRooms;
  });

  
  // Detailed status for each property
  processedProperties.forEach((property: Property) => {
    let status = 'Unknown';
    if (notStartedProperties.includes(property as any)) {
      status = 'Not Started';
    } else if (inProgressProperties.includes(property as any)) {
      status = 'In Progress';
    } else if (completedProperties.includes(property as any)) {
      status = 'Completed';
    }
    
    property.roomTasks?.forEach((roomTask, index) => {
      const completedTasks = roomTask.tasks?.filter(task => task.isCompleted).length || 0;
      const totalTasks = roomTask.tasks?.length || 0;
    });
  });
  
  // Total number of properties (both active and inactive)
  const totalProperties = processedProperties.length;

  if (loading) {
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
          <p className="text-gray-600 dark:text-gray-400">Overview of cleaning progress and schedules</p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProperties}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{notStartedProperties.length}</p>
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
                  {inProgressProperties.length}
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedProperties.length}</p>
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