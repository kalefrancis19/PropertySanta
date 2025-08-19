'use client';

import { useNotificationContext } from '@/contexts/NotificationContext';
import { useState } from 'react';

export default function DebugNotificationsPage() {
  const { showSuccess, showError, showWarning, showInfo } = useNotificationContext();
  const [testCount, setTestCount] = useState(0);

  const testNotification = (type: 'success' | 'error' | 'warning' | 'info') => {
    const count = testCount + 1;
    setTestCount(count);
    
    console.log(`Testing ${type} notification #${count}`);
    
    switch (type) {
      case 'success':
        showSuccess(`Test Success #${count}`, `This is a test success notification at ${new Date().toLocaleTimeString()}`);
        break;
      case 'error':
        showError(`Test Error #${count}`, `This is a test error notification at ${new Date().toLocaleTimeString()}`);
        break;
      case 'warning':
        showWarning(`Test Warning #${count}`, `This is a test warning notification at ${new Date().toLocaleTimeString()}`);
        break;
      case 'info':
        showInfo(`Test Info #${count}`, `This is a test info notification at ${new Date().toLocaleTimeString()}`);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Debug Notifications
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Notification System
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => testNotification('success')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Test Success
            </button>
            <button
              onClick={() => testNotification('error')}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Test Error
            </button>
            <button
              onClick={() => testNotification('warning')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Test Warning
            </button>
            <button
              onClick={() => testNotification('info')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Test Info
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Test Count: {testCount}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Check the browser console for debug logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
