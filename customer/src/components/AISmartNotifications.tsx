'use client';

import { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  Cloud, 
  Wrench,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export default function AISmartNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  const mockData = {
    upcomingCleaning: {
      date: 'April 25, 2024',
      time: '10:00 AM',
      property: '123 Main St'
    },
    recentIssues: ['Carpet stain in living room', 'Ceiling fan dusting needed'],
    weatherForecast: 'Sunny, 75°F - Perfect for deep cleaning',
    maintenanceReminders: ['HVAC filter replacement due', 'Gutter cleaning recommended']
  };

  const handleGenerateNotifications = async () => {
    setIsLoading(true);
    // Simulate AI notification generation
    setTimeout(() => {
      setNotifications([
        "🌞 Perfect weather for deep cleaning on April 25! Sunny 75°F conditions ideal for thorough service.",
        "🧹 Reminder: Address carpet stain in living room during next cleaning session.",
        "🌪️ Ceiling fan dusting recommended - cleaner will focus on this area.",
        "💡 HVAC filter replacement due - consider scheduling maintenance.",
        "🌧️ Gutter cleaning recommended before rainy season."
      ]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
          <Bell className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Smart Notifications</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Contextual alerts and reminders</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Context Data */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Context Data:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <span className="text-gray-600 dark:text-gray-400">Upcoming:</span>
                <span className="font-medium text-gray-900 dark:text-white">{mockData.upcomingCleaning.date} at {mockData.upcomingCleaning.time}</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-gray-600 dark:text-gray-400">Issues:</span>
                <span className="font-medium text-gray-900 dark:text-white">{mockData.recentIssues.length} items</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Cloud className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">Weather:</span>
                <span className="font-medium text-gray-900 dark:text-white">{mockData.weatherForecast}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wrench className="h-4 w-4 text-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400">Maintenance:</span>
                <span className="font-medium text-gray-900 dark:text-white">{mockData.maintenanceReminders.length} reminders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Notifications */}
        {notifications.length > 0 && (
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
            <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-3">AI Generated Notifications:</h4>
            <div className="space-y-2">
              {notifications.map((notification, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-primary-200 dark:border-primary-700">
                  <Bell className="h-4 w-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-primary-800 dark:text-primary-200">{notification}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleGenerateNotifications}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating notifications...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate Smart Notifications</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
} 