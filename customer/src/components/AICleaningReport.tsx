'use client';

import { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  Star,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface CleaningReport {
  date: string;
  cleaner: string;
  rating: number;
  issues: string[];
  notes: string;
  rooms: string[];
}

export default function AICleaningReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');

  const mockReport: CleaningReport = {
    date: '2024-04-18',
    cleaner: 'Logan T.',
    rating: 4.5,
    issues: ['Minor carpet stain in living room', 'Ceiling fan needs dusting'],
    notes: 'Overall excellent cleaning. Kitchen surfaces spotless, bathroom fixtures polished. Minor attention needed for carpet stain and ceiling fan.',
    rooms: ['Living Room', 'Kitchen', 'Bathroom', 'Bedroom', 'Dining Room']
  };

  const handleAnalyzeReport = async () => {
    setIsLoading(true);
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysis(`Cleaning Report Analysis for ${mockReport.date}:

**Overall Assessment**: Excellent cleaning quality with ${mockReport.rating}-star rating
**Areas of Excellence**: Kitchen surfaces spotless, bathroom fixtures polished
**Attention Needed**: Minor carpet stain in living room, ceiling fan dusting required
**Recommendations**:
- Address carpet stain with specialized cleaner
- Include ceiling fan cleaning in next service
- Continue excellent work on kitchen and bathroom areas

**Summary**: High-quality cleaning with minor areas for improvement.`);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Report Analysis</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Intelligent cleaning report insights</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Report Summary */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-gray-600 dark:text-gray-400">Date:</span>
              <span className="font-medium text-gray-900 dark:text-white">{mockReport.date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-gray-600 dark:text-gray-400">Cleaner:</span>
              <span className="font-medium text-gray-900 dark:text-white">{mockReport.cleaner}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-600 dark:text-gray-400">Rating:</span>
              <span className="font-medium text-gray-900 dark:text-white">{mockReport.rating}/5</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-gray-600 dark:text-gray-400">Issues:</span>
              <span className="font-medium text-gray-900 dark:text-white">{mockReport.issues.length}</span>
            </div>
          </div>
        </div>

        {/* Issues List */}
        {mockReport.issues.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <h4 className="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Issues Found:</span>
            </h4>
            <ul className="space-y-1">
              {mockReport.issues.map((issue, index) => (
                <li key={index} className="text-sm text-red-800 dark:text-red-200 flex items-start space-x-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Analysis */}
        {analysis && (
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
            <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">AI Analysis:</h4>
            <div className="text-sm text-primary-800 dark:text-primary-200 whitespace-pre-line">
              {analysis}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAnalyzeReport}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyzing report...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Analyze with AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
} 