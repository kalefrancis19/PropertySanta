'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Calendar, 
  Star, 
  Camera, 
  User,
  Download,
  Share
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import DashboardLayout from '@/components/DashboardLayout';
import { propertyAPI, Property } from '@/services/api';
import { format } from 'date-fns';

// Extend the Property interface to include issues, aiFeedback, and photos
interface PropertyWithIssues extends Omit<Property, 'issues' | 'aiFeedback' | 'photos'> {
  issues?: Array<{
    _id: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved';
    createdAt: string;
    updatedAt: string;
  }>;
  aiFeedback?: Array<{
    feedback: string;
    confidence: number;
    suggestions: string[];
    _id: string;
    createdAt: string;
    updatedAt: string;
  }>;
  photos?: Array<{
    _id: string;
    url: string;
    type: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

interface RoomFeedback {
  roomType: string;
  score: number;
  feedback: string;
  suggestions: string[];
  confidence: number;
}

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
  roomFeedbacks: RoomFeedback[];
  notes: string;
  status: 'completed' | 'in-progress' | 'scheduled';
  lastCleaned?: string;
  nextCleaning?: string;
  progress?: number;
}

// Helper to convert "X days Y hours Z minutes" -> total minutes
function parseTimeString(str: string): number {
  if (!str) return 0;

  let totalMinutes = 0;
  const regex = /(\d+)\s*(day|days|hour|hours|minute|minutes)/gi;
  let match;

  while ((match = regex.exec(str)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    if (unit.startsWith('day')) totalMinutes += value * 24 * 60;
    else if (unit.startsWith('hour')) totalMinutes += value * 60;
    else if (unit.startsWith('minute')) totalMinutes += value;
  }

  return totalMinutes;
}

// Helper to convert total minutes -> "X days Y hours Z minutes"
function formatMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0 minutes';
  
  const days = Math.floor(totalMinutes / (24 * 60));
  totalMinutes %= 24 * 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);

  return parts.join(' ');
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<CleaningReport | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [properties, setProperties] = useState<PropertyWithIssues[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  // Fetch properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await propertyAPI.getAll();
        setProperties(data);
      } catch (err) {
        setError('Failed to load properties. Please try again later.');
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Calculate average rating from AI feedback scores
  const calculateAverageRating = (aiFeedback: Array<{feedback: string}>) => {
    console.log('AI Feedback received:', JSON.stringify(aiFeedback, null, 2));
    
    if (!aiFeedback || aiFeedback.length === 0) {
      console.log('No AI feedback available, using default rating 4.5');
      return 4.5; // Default to 4.5 if no feedback
    }
    
    const scores = aiFeedback.map(feedback => {
      // Extract the score percentage from feedback string (e.g., "Score: 95%")
      const match = feedback.feedback.match(/Score:\s*(\d+)%/);
      const score = match ? parseInt(match[1], 10) : 0;
      console.log(`Processing feedback: "${feedback.feedback}" -> Extracted score: ${score}`);
      return score;
    }).filter(score => !isNaN(score));
    
    console.log('Scores extracted:', scores);
    
    if (scores.length === 0) {
      console.log('No valid scores found in AI feedback, using default rating 4.5');
      return 4.5; // Default if no valid scores found
    }
    
    // Calculate average and convert to 5-point scale
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const rating = parseFloat((averageScore / 20).toFixed(1));
    console.log(`Calculated average score: ${averageScore}% -> Rating: ${rating}/5`);
    
    return rating; // Convert percentage to 5-point scale (e.g., 90% -> 4.5)
  };

  // Transform properties to reports format and filter out properties with no completed tasks
  const reports = useMemo<CleaningReport[]>(() => {
    return properties
      .flatMap((property: PropertyWithIssues) => {
        const roomTasks = property.roomTasks || [];
        const totalTasks = roomTasks.length;
        const completedTasks = roomTasks.filter(room => room.isCompleted).length;

        if (completedTasks === 0) return [];

        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const status: 'completed' | 'in-progress' | 'scheduled' = 
          progress >= 100 ? 'completed' : 'in-progress';

        // Calculate total estimated time from all room tasks
        const totalMinutes = roomTasks.reduce((total, room) => {
          return total + parseTimeString(room.estimatedTime);
        }, 0);

        // Calculate rating from AI feedback if available
        console.log('Processing property:', property._id);
        console.log('AI Feedback exists:', !!property.aiFeedback);
        if (property.aiFeedback) {
          console.log('AI Feedback length:', property.aiFeedback.length);
        }
        
        const rating = property.aiFeedback && property.aiFeedback.length > 0
          ? calculateAverageRating(property.aiFeedback)
          : 4.5; // Default rating if no feedback
          
        console.log('Final rating for property:', rating);

        // Process AI feedback for each room
        const roomFeedbacks: RoomFeedback[] = [];
        if (property.aiFeedback && property.aiFeedback.length > 0) {
          property.aiFeedback.forEach(fb => {
            const match = fb.feedback.match(/([a-zA-Z]+)\s+cleaning analysis - Score:\s*(\d+)%/i);
            if (match) {
              const roomType = match[1].charAt(0).toUpperCase() + match[1].slice(1);
              const score = parseInt(match[2], 10);
              roomFeedbacks.push({
                roomType,
                score,
                feedback: fb.feedback,
                suggestions: fb.suggestions || [],
                confidence: fb.confidence || 0
              });
            }
          });
        }

        const report: CleaningReport = {
          id: property._id || '',
          date: property.updatedAt ? format(new Date(property.updatedAt), 'yyyy-MM-dd') : 'N/A',
          cleaner: property.owner?.name || 'Not assigned',
          property: property.name || property.propertyId || 'Unnamed Property',
          duration: totalMinutes > 0 ? formatMinutes(totalMinutes) : 'N/A',
          rating: rating,
          photos: property.photos?.length || 0,
          rooms: roomTasks.map((room: { roomType: string }) => room.roomType),
          issues: property.issues?.map(
            (issue: { description: string; location?: string; type?: string }) =>
              `${issue.location ? `In ${issue.location}, ` : ''}${issue.type ? `${issue.type} : ` : ''} ${issue.description}\n${issue.description}`
          ) || [],
          roomFeedbacks,
          notes: property.instructions || 'No additional notes.',
          status,
          lastCleaned: property.updatedAt ? format(new Date(property.updatedAt), 'MMM d, yyyy') : 'Never',
          nextCleaning: property.updatedAt 
            ? format(new Date(new Date(property.updatedAt).setDate(new Date(property.updatedAt).getDate() + 7)), 'MMM d, yyyy')
            : 'Not scheduled',
          progress
        };

        return [report];
      })
      .flat();
  }, [properties]);

  const filteredReports = reports.filter(report => 
    filterStatus === 'all' || 
    (filterStatus === 'completed' && report.status === 'completed') ||
    (filterStatus === 'in-progress' && report.status === 'in-progress') ||
    (filterStatus === 'scheduled' && report.status === 'scheduled')
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
            {/* Report List */}
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
                      <div className="space-y-4">
                        {/* AI Feedback Section */}
                        {selectedReport.roomFeedbacks.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">AI Cleaning Analysis</h3>
                            <div className="space-y-4">
                              {selectedReport.roomFeedbacks.map((feedback, index) => (
                                <div key={index} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-medium text-blue-800 dark:text-blue-200">
                                      {feedback.roomType} - {feedback.score}%
                                    </h4>
                                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 rounded-full">
                                      {Math.round(feedback.confidence * 100)}% confidence
                                    </span>
                                  </div>
                                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                                    {feedback.feedback}
                                  </p>
                                  {feedback.suggestions.length > 0 && (
                                    <div className="mt-3">
                                      <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                                        Suggestions for improvement:
                                      </h5>
                                      <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                        {feedback.suggestions.map((suggestion, idx) => (
                                          <li key={idx}>{suggestion}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Issues Section */}
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
