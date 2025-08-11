'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity,
  MapPin,
  Home,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Plus,
  MoreVertical
} from 'lucide-react';
import { propertyAPI, Property as BaseProperty } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { format } from 'date-fns';

interface Property extends Omit<BaseProperty, 'roomTasks'> {
  issues?: Array<{
    _id: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved';
    createdAt: string;
    updatedAt: string;
  }>;
  roomTasks: Array<{
    roomType: string;
    tasks: Array<{
      description: string;
      isCompleted: boolean;
      estimatedTime: string;
      specialNotes?: string;
    }>;
    specialInstructions: string[];
    fragileItems: string[];
  }>;
}

interface TaskProgress {
  total: number;
  completed: number;
  progress: number;
}

export default function TasksPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: 'all',
    hasIssues: false
  });
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Memoized calculation of progress for all properties
  const progressMap = useMemo(() => {
    const map = new Map<string, TaskProgress>();
    properties.forEach(property => {
      const totalRooms = property.roomTasks?.length || 0;
      const completedRooms = (property.roomTasks || []).filter(room => 
        room.isCompleted === true
      ).length;
      map.set(property._id || '', {
        total: totalRooms,
        completed: completedRooms,
        progress: totalRooms > 0 ? Math.round((completedRooms / totalRooms) * 100) : 0
      });
    });
    return map;
  }, [properties]);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertyAPI.getAll();
      setProperties(data);
    } catch (err) {
      setError('Failed to load properties. Please try again later.');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Memoized filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      // Search term filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
          property.name.toLowerCase().includes(term) || 
          property.address.toLowerCase().includes(term) ||
          property.propertyId.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }
      
      // Type filter
      if (filters.type && property.type !== filters.type) {
        return false;
      }
      
      // Status filter
      if (filters.status !== 'all') {
        const status = getPropertyStatus(property);
        if (status !== filters.status) return false;
      }
      
      // Issues filter
      if (filters.hasIssues && (!property.issues || property.issues.length === 0)) {
        return false;
      }
      
      return true;
    });
  }, [properties, searchTerm, filters, progressMap]);

  const getPropertyStatus = useCallback((property: Property) => {
    // Get the progress from the map or calculate it if not available
    const progress = progressMap.get(property._id || '') || { 
      total: property.roomTasks?.length || 0, 
      completed: property.roomTasks?.filter(room => 
        room.tasks.every(task => task.isCompleted)
      ).length || 0 
    };
    
    // If no rooms, consider it not started
    if (progress.total === 0) return 'not_started';
    
    // If all rooms are completed, mark as completed
    if (progress.completed === progress.total) return 'completed';
    
    // If some rooms are completed, mark as in progress
    if (progress.completed > 0) return 'in_progress';
    
    // Otherwise, not started
    return 'not_started';
  }, [progressMap]);

  const getStatusBadge = useCallback((status: string) => {
    const statusMap = {
      completed: {
        text: 'Completed',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: <CheckCircle className="h-4 w-4 mr-1" aria-hidden="true" />
      },
      in_progress: {
        text: 'In Progress',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: <Activity className="h-4 w-4 mr-1" aria-hidden="true" />
      },
      not_started: {
        text: 'Not Started',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
        icon: <Clock className="h-4 w-4 mr-1" aria-hidden="true" />
      }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.not_started;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.icon}
        {statusInfo.text}
      </span>
    );
  }, []);

  const togglePropertyExpand = useCallback((propertyId: string) => {
    setExpandedProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  }, []);

  const renderPropertyCard = (property: Property) => {
    const progress = progressMap.get(property._id || '') || { total: 0, completed: 0, progress: 0 };
    const status = getPropertyStatus(property);
    const isExpanded = expandedProperties.has(property._id || '');

    return (
      <div key={property._id} className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        {/* Property Header */}
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {property.name}
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {property.propertyId}
                </span>
              </h3>
              {property.scheduledTime && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(property.scheduledTime).toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              )}
            </div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{property.address}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(status)}
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls={`property-${property._id}-content`}
              className="ml-2 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => togglePropertyExpand(property._id || '')}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-5 w-5" aria-hidden="true" />
              )}
              <span className="sr-only">
                {isExpanded ? 'Collapse' : 'Expand'} property details
              </span>
            </button>
          </div>
        </div>
        
        {/* Expanded Content */}
        {isExpanded && (
          <div 
            id={`property-${property._id}-content`}
            className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6"
          >
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <span>Progress</span>
                <span>{progress.completed} of {progress.total} rooms completed</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${progress.progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
            </div>
            
            {/* Room Tasks */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Room Tasks</h4>
              <div className="space-y-4">
                {property.roomTasks.map((room, roomIndex) => (
                  <div key={roomIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        {room.roomType}
                      </h5>
                    </div>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {room.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={task.isCompleted}
                              onChange={() => {}}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              disabled
                            />
                            <span className={`ml-3 text-sm ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                              {task.description}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {task.estimatedTime}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Special Instructions */}
            {property.roomTasks.some(room => room.specialInstructions.length > 0) && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Special Instructions</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {property.roomTasks.flatMap((room, index) =>
                    room.specialInstructions.map((instruction, i) => (
                      <li key={`${index}-${i}`}>{instruction}</li>
                    ))
                  )}
                </ul>
              </div>
            )}
            
            {/* Fragile Items */}
            {/* {property.roomTasks.some(room => room.fragileItems.length > 0) && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-2">
                  Handle with Care
                </h4>
                <div className="flex flex-wrap gap-2">
                  {property.roomTasks.flatMap((room, index) =>
                    room.fragileItems.map((item, i) => (
                      <span 
                        key={`${index}-${i}`}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      >
                        {item}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )} */}
          </div>
        )}
      </div>
    );
  };

  if (loading && properties.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading properties...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={fetchProperties}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cleaning Tasks</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor cleaning progress and schedules</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <label htmlFor="search" className="sr-only">Search properties</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="search"
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filter Button */}
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              aria-controls="filters-section"
            >
              <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
              Filters
              {showFilters ? (
                <ChevronUp className="ml-2 h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div 
            id="filters-section"
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Property Type
                </label>
                <select
                  id="type"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="office">Office</option>
                </select>
              </div>
              
              {/* <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">All Statuses</option>
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div> */}
              
              {/* <div className="flex items-end">
                <div className="flex items-center h-5">
                  <input
                    id="has-issues"
                    name="has-issues"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={filters.hasIssues}
                    onChange={(e) => setFilters({ ...filters, hasIssues: e.target.checked })}
                  />
                </div>
                <label 
                  htmlFor="has-issues" 
                  className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Show only properties with issues
                </label>
              </div> */}
            </div>
          </div>
        )}
        
        {/* Properties List */}
        <div className="space-y-4">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <Home className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No properties found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || Object.values(filters).some(Boolean) 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No properties have been added yet.'}
              </p>
            </div>
          ) : (
            filteredProperties.map(property => renderPropertyCard(property))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}