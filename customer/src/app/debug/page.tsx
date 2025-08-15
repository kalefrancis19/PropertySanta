'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testAPI = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      console.log('Testing API connection...');
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('API Test Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const testTasksAPI = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      console.log('Testing Tasks API...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/admin`);
      console.log('Tasks Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Tasks Response data:', data);
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Tasks API Test Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          API Debug Page
        </h1>
        
        <div className="space-y-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Environment Variables
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL || 'Not set'}
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={testAPI}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Properties API'}
            </button>
            
            <button
              onClick={testTasksAPI}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Tasks API'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 dark:text-red-200 font-medium">Error:</h3>
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}
        
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-gray-900 dark:text-white font-medium mb-2">Result:</h3>
            <pre className="text-sm text-gray-600 dark:text-gray-400 overflow-auto max-h-96">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 