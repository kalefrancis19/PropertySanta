'use client';

import { useNotificationContext } from '@/contexts/NotificationContext';

export default function TestNotificationsPage() {
  const { showSuccess, showError, showWarning, showInfo } = useNotificationContext();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Notification System Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Success Notifications
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => showSuccess('Login Successful', 'Welcome back! Redirecting to dashboard...')}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Show Login Success
              </button>
              <button
                onClick={() => showSuccess('Task Completed', 'The cleaning task has been successfully completed!')}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Show Task Success
              </button>
              <button
                onClick={() => showSuccess('Profile Updated', 'Your profile information has been saved successfully.')}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Show Profile Success
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Error Notifications
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => showError('Invalid Credentials', 'The email or password you entered is incorrect. Please try again.')}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Show Invalid Credentials
              </button>
              <button
                onClick={() => showError('Network Error', 'Unable to connect to the server. Please check your internet connection and try again.')}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Show Network Error
              </button>
              <button
                onClick={() => showError('Server Error', 'Something went wrong on our end. Please try again later.')}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Show Server Error
              </button>
              <button
                onClick={() => showError('Too Many Attempts', 'Too many login attempts. Please wait a few minutes before trying again.')}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Show Rate Limit Error
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Warning Notifications
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => showWarning('Session Expiring', 'Your session will expire in 5 minutes. Please save your work.')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Show Session Warning
              </button>
              <button
                onClick={() => showWarning('Maintenance Notice', 'Scheduled maintenance will begin in 30 minutes.')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Show Maintenance Warning
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Info Notifications
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => showInfo('New Feature', 'We\'ve added new AI-powered cleaning insights to your dashboard!')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Show New Feature Info
              </button>
              <button
                onClick={() => showInfo('System Update', 'The system has been updated to version 2.1.0')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Show System Update Info
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Test All
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                showSuccess('Test Success', 'This is a test success notification');
                setTimeout(() => showError('Test Error', 'This is a test error notification'), 1000);
                setTimeout(() => showWarning('Test Warning', 'This is a test warning notification'), 2000);
                setTimeout(() => showInfo('Test Info', 'This is a test info notification'), 3000);
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Test All Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
