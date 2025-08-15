'use client';

import { useState, useEffect } from 'react';
import { propertyAPI, taskAPI } from '@/services/api';

export default function TestPage() {
  const [properties, setProperties] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [propertiesData, tasksData] = await Promise.all([
        propertyAPI.getAll(),
        taskAPI.getAll()
      ]);
      
      setProperties(propertiesData);
      setTasks(tasksData);
    } catch (error) {
      console.error('API Test Error:', error);
      setError(error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          API Connection Test
        </h1>
        
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Testing API connection...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 dark:text-red-200 font-medium">Error:</h3>
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}
        
        {!loading && !error && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Properties ({properties.length})
              </h2>
              <div className="space-y-2">
                {properties.map((property: any) => (
                  <div key={property._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="font-medium text-gray-900 dark:text-white">{property.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{property.address}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Tasks ({tasks.length})
              </h2>
              <div className="space-y-2">
                {tasks.map((task: any) => (
                  <div key={task._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status: {task.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8">
          <button
            onClick={testAPI}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Test Again
          </button>
        </div>
      </div>
    </div>
  );
} 