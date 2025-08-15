'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  Home, 
  Users, 
  Clock,
  TrendingUp
} from 'lucide-react';

export default function AICleaningInsights() {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<string>('');

  const mockPropertyData = {
    address: '123 Main St',
    size: '2,500 sq ft',
    rooms: 4,
    lastCleaning: '2024-04-18',
    cleaner: 'Logan T.',
    rating: 4.8
  };

  const handleGetInsights = async () => {
    setIsLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      setInsights(`Based on your property at ${mockPropertyData.address} (${mockPropertyData.size}, ${mockPropertyData.rooms} rooms), here are personalized recommendations:

1. **Weekly Cleaning Schedule**: Maintain consistent weekly cleanings for optimal results
2. **Pet-Friendly Focus**: Use eco-friendly products safe for pets and family
3. **Hardwood Floor Care**: Use specialized cleaners to preserve your hardwood floors
4. **Green Cleaning**: All products are eco-friendly and safe for your home
5. **Special Attention**: Focus on high-traffic areas like kitchen and living room

Your property is well-maintained with regular cleanings!`);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Cleaning Insights</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Personalized recommendations for your property</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Property Info */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Home className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-gray-600 dark:text-gray-400">Address:</span>
              <span className="font-medium text-gray-900 dark:text-white">{mockPropertyData.address}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-gray-600 dark:text-gray-400">Size:</span>
              <span className="font-medium text-gray-900 dark:text-white">{mockPropertyData.size}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-gray-600 dark:text-gray-400">Rooms:</span>
              <span className="font-medium text-gray-900 dark:text-white">{mockPropertyData.rooms}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-gray-600 dark:text-gray-400">Rating:</span>
              <span className="font-medium text-gray-900 dark:text-white">{mockPropertyData.rating}/5</span>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {insights && (
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
            <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">AI Recommendations:</h4>
            <div className="text-sm text-primary-800 dark:text-primary-200 whitespace-pre-line">
              {insights}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleGetInsights}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating insights...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Get AI Insights</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
} 