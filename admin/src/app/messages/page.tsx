'use client';

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Messages
          </h1>
          <div className="w-16 h-1 bg-blue-500 mx-auto rounded"></div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Coming Soon!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Our messaging functionality is currently under development. 
            You'll be able to communicate with your team and customers soon.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>What to expect:</strong> Real-time messaging, notifications, 
              and seamless communication tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 