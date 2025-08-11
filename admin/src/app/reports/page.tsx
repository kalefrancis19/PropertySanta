'use client';

import { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Star, 
  Camera, 
  MapPin, 
  User,
  ArrowLeft,
  Download,
  Share,
  Filter,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import DashboardLayout from '@/components/DashboardLayout';

interface CleaningReport {
  id: string;
  date: string;
  cleaner: string;
  property: string;
  duration: string;
  rating: number;
  photos: number;
  rooms: string[];
  issues: string[];
  notes: string;
  status: 'completed' | 'in-progress' | 'scheduled';
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<CleaningReport | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const { theme, toggleTheme } = useTheme();

  const reports: CleaningReport[] = [
    {
      id: '1',
      date: '2024-04-18',
      cleaner: 'Logan T.',
      property: '123 Main St',
      duration: '2.5 hours',
      rating: 4.5,
      photos: 8,
      rooms: ['Living Room', 'Kitchen', 'Bathroom', 'Bedroom'],
      issues: ['Minor stain on carpet', 'Dust on ceiling fan'],
      notes: 'Overall excellent cleaning. Kitchen surfaces spotless. Bathroom fixtures polished. Minor attention needed for carpet stain in living room. Ceiling fan needs dusting.',
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-04-11',
      cleaner: 'Sarah M.',
      property: '123 Main St',
      duration: '2.0 hours',
      rating: 5.0,
      photos: 6,
      rooms: ['Living Room', 'Kitchen', 'Bathroom', 'Bedroom'],
      issues: [],
      notes: 'Perfect cleaning service. All areas thoroughly cleaned and sanitized. No issues found.',
      status: 'completed'
    },
    {
      id: '3',
      date: '2024-04-04',
      cleaner: 'Mike R.',
      property: '123 Main St',
      duration: '2.3 hours',
      rating: 4.0,
      photos: 7,
      rooms: ['Living Room', 'Kitchen', 'Bathroom', 'Bedroom'],
      issues: ['Light dust on shelves', 'Kitchen counter needs attention'],
      notes: 'Good cleaning service. Minor dust accumulation on shelves. Kitchen counter could use more attention.',
      status: 'completed'
    }
  ];

  const filteredReports = reports.filter(report => 
    filterStatus === 'all' || report.status === filterStatus
  );

  return (
    <DashboardLayout>
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cleaning Reports</h1>
      <p className="text-gray-600 dark:text-gray-400">Analysis of cleaning progress and schedules</p>
    </div>

    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-end px-10">
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
        <option value="all">All Reports</option>
        <option value="completed">Completed</option>
        <option value="in-progress">In Progress</option>
        <option value="scheduled">Scheduled</option>
      </select>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-4 rounded-xl cursor-pointer transition-colors ${
                    selectedReport?.id === report.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 border border-primary-300 dark:border-primary-700'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{report.property}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{report.date}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{report.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{report.cleaner}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Camera className="h-3 w-3" />
                      <span>{report.photos} photos</span>
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      report.status === 'completed' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : report.status === 'in-progress'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Details */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedReport.property}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{selectedReport.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Download className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Share className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Cleaning Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Cleaner</p>
                            <p className="font-medium text-gray-900 dark:text-white">{selectedReport.cleaner}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                            <p className="font-medium text-gray-900 dark:text-white">{selectedReport.duration}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Star className="h-5 w-5 text-yellow-400" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                            <p className="font-medium text-gray-900 dark:text-white">{selectedReport.rating}/5</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Camera className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Photos</p>
                            <p className="font-medium text-gray-900 dark:text-white">{selectedReport.photos}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Rooms Cleaned</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.rooms.map((room, index) => (
                          <span key={index} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-full text-sm">
                            {room}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Issues Found</h3>
                      {selectedReport.issues.length > 0 ? (
                        <div className="space-y-2">
                          {selectedReport.issues.map((issue, index) => (
                            <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-red-800 dark:text-red-200">{issue}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No issues found</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Cleaner Notes</h3>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedReport.notes}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Photos</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Camera className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Camera className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Report</h3>
                  <p className="text-gray-500 dark:text-gray-400">Choose a report from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
  );
} 