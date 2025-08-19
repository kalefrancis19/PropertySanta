'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Calendar, 
  Star, 
  Camera, 
  User,
  ArrowLeft,
  Home,
  List
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../components/AuthProvider';
import { ProtectedRoute } from '../../components/ProtectedRoute';

interface RoomFeedback {
  roomType: string;
  score: number;
  feedback: string;
  suggestions: string[];
  improvements?: string[];
  confidence: number;
}

interface CleaningReport {
  id: string;
  date: string;
  cleaner: string;
  customer: string;
  property: string;
  propertyId?: string;
  duration: string;
  rating: number;
  photos: number;
  uploadedPhotos?: any[];
  rooms: string[];
  issues: string[];
  roomFeedbacks: RoomFeedback[];
  notes: string;
  status: 'completed' | 'in-progress' | 'pending';
  lastCleaned?: string;
  nextCleaning?: string;
  progress?: number;
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<CleaningReport | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [tasks, setTasks] = useState<any[]>([]);
  const [properties, setProperties] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();
  const { authState } = useAuth();
  
  const user = authState.user;
  const userName = user?.name || 'Cleaner';
  const userInitial = userName.charAt(0).toUpperCase();

  // Fetch all necessary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch tasks assigned to this cleaner
        const tasksResponse = await apiService.getTasks({
          assignedTo: authState.user?._id
        });
        
        if (tasksResponse.success) {
          setTasks(tasksResponse.data || []);
        } else {
          setError(tasksResponse.message || 'Failed to load tasks');
          return;
        }

        // 2. Collect unique property IDs
        const propertyIds = Array.from(new Set(
          tasksResponse.data
            .map((task: any) => task.propertyId)
            .filter(Boolean)
        )) as string[];

        // 3. Fetch properties
        const propertiesResponse = propertyIds.length > 0 
          ? await Promise.all(propertyIds.map(id => 
              apiService.getPropertyDetails(id).catch(() => null)
            ))
          : [];

        // 4. Convert properties array to record for easy lookup
        const propertiesRecord = propertiesResponse.reduce((acc: Record<string, any>, property) => {
          if (property?.success && property.property) {
            acc[property.property._id] = property.property;
          }
          return acc;
        }, {});

        setProperties(propertiesRecord);
        
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (authState.isAuthenticated && authState.user) {
      fetchData();
    }
  }, [authState.isAuthenticated, authState.user]);

  // Transform tasks to reports format
  const reports = useMemo<CleaningReport[]>(() => {
    return tasks.map((task: any) => {
      // Get property with fallback
      const property = properties[task.propertyId] || {
        _id: task.propertyId,
        name: `Property #${task.propertyId?.slice(-6) || 'N/A'}`,
        customer: null
      };
      
      // Get customer name if available
      const customerName = property.customer 
        ? typeof property.customer === 'string' 
          ? `Customer #${property.customer.slice(-6)}`
          : property.customer.name || `Customer #${property.customer._id?.slice(-6) || 'N/A'}`
        : 'Unknown Customer';

      // Calculate task status and progress
      const requirements = task.requirements || [];
      const completedRequirements = requirements.filter(req => 
        req.isCompleted || (req.tasks && req.tasks.every(t => t.isCompleted))
      ).length;

      const totalTasks = requirements.length;
      const progress = totalTasks > 0 ? Math.round((completedRequirements / totalTasks) * 100) : 0;
      let status: 'completed' | 'in-progress' | 'pending' = 'pending';
      
      if (progress >= 100) {
        status = 'completed';
      } else if (progress > 0) {
        status = 'in-progress';
      }

      // Calculate rating based on AI feedback if available, otherwise use task completion
      let rating = 0;
      let roomFeedbacks: RoomFeedback[] = [];

      if (task.aiFeedback && task.aiFeedback.length > 0) {
        // Use AI feedback for rating if available
        roomFeedbacks = task.aiFeedback.map(fb => {
          const match = fb.feedback?.match(/([a-zA-Z]+)\s+cleaning analysis - Score:\s*(\d+)%/i);
          if (match) {
            const roomType = match[1].charAt(0).toUpperCase() + match[1].slice(1);
            const score = parseInt(match[2], 10);
            return {
              roomType,
              score,
              feedback: fb.feedback || '',
              suggestions: fb.suggestions || [],
              confidence: fb.confidence || 0
            };
          }
          return null;
        }).filter(Boolean) as RoomFeedback[];
        
        // Calculate average rating from room feedbacks
        if (roomFeedbacks.length > 0) {
          const totalScore = roomFeedbacks.reduce((sum, fb) => sum + (fb?.score || 0), 0);
          const averagePercentage = totalScore / roomFeedbacks.length;
          rating = parseFloat((averagePercentage / 20).toFixed(1));
        }
      } else {
        // Fallback to task completion based rating
        if (requirements.length > 0) {
          roomFeedbacks = requirements
            .filter(req => req.roomType)
            .map(req => {
              const roomTasks = req.tasks || [];
              const completedTasks = roomTasks.filter(t => t.isCompleted).length;
              const roomRating = roomTasks.length > 0 ? (completedTasks / roomTasks.length) * 5 : 0;
              return {
                roomType: req.roomType,
                score: parseFloat(roomRating.toFixed(1)),
                feedback: '',
                suggestions: [],
                confidence: 0
              };
            });
          
          // Calculate average rating
          if (roomFeedbacks.length > 0) {
            const totalScore = roomFeedbacks.reduce((sum, fb) => sum + fb.score, 0);
            rating = parseFloat((totalScore / roomFeedbacks.length).toFixed(1));
          }
        }
      }

      return {
        id: task._id || '',
        date: task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'N/A',
        cleaner: userName,
        customer: customerName,
        property: property?.name || `Property #${task.propertyId?.slice(-6) || 'N/A'}`,
        propertyId: task.propertyId,
        duration: task.scheduledTime ? new Date(task.scheduledTime).toLocaleString() : 'Not scheduled',
        rating,
        photos: task.photos?.length || 0,
        uploadedPhotos: task.photos || [],
        rooms: requirements.map(req => req.roomType).filter(Boolean) as string[],
        issues: (task.issues || []).map(issue => 
          `${issue.location ? `In ${issue.location}, ` : ''}${issue.type ? `${issue.type}: ` : ''}${issue.description}`
        ),
        roomFeedbacks,
        notes: task.specialRequirement || 'No additional notes.',
        status,
        lastCleaned: task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'Never',
        nextCleaning: task.scheduledTime 
          ? new Date(task.scheduledTime).toLocaleDateString()
          : 'Not scheduled',
        progress
      };
    });
  }, [tasks, properties, userName]);

  const filteredReports = reports.filter(report => 
    report.status !== 'pending' && (
      filterStatus === 'all' || 
      (filterStatus === 'completed' && report.status === 'completed') ||
      (filterStatus === 'in-progress' && report.status === 'in-progress')
    )
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col pt-24">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col pt-24">
      
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-6 py-6 shadow-lg border-b border-white/20 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/tasks')}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Reports
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  View your cleaning performance and results
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => router.push('/profile')}
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <span className="text-white font-semibold text-lg">{userInitial}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pt-12 pb-32">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cleaning Reports</h3>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Reports</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>

          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try again
              </button>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No reports found</h3>
              <p className="text-gray-500 dark:text-gray-400">You don't have any completed tasks yet.</p>
            </div>
          ) : (
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
                          ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                          : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h1 className="text-lg font-semibold text-gray-900 dark:text-white uppercase">Task #{report.id.slice(-6)}</h1>
                          <h3 className="font-medium text-gray-900 dark:text-white mt-1">Property: {report.property}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Customer: {report.customer}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{report.date}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{report.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>You</span>
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
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedReport.property}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{selectedReport.date}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Cleaning Details</h3>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Cleaner</p>
                                <p className="font-medium text-gray-900 dark:text-white">{selectedReport.cleaner}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled Time</p>
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
                              <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                              <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
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
                                  <div key={index} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-medium text-green-800 dark:text-green-200">
                                        {feedback.roomType} - {Math.round(feedback.score)}%
                                      </h4>
                                    </div>
                                    {feedback.improvements?.length > 0 && (
                                      <div className="mt-3">
                                        <h5 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                                          Improvements:
                                        </h5>
                                        <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-300 space-y-1">
                                          {feedback.improvements.map((improvement, idx) => (
                                            <li key={idx}>{improvement}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {feedback.suggestions.length > 0 && (
                                      <div className="mt-3">
                                        <h5 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                                          Suggestions for improvement:
                                        </h5>
                                        <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-300 space-y-1">
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
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Special Requirements</h3>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{selectedReport.notes}</p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Photos</h3>

                          <div className="grid grid-cols-2 gap-4">
                            {selectedReport.uploadedPhotos.map((photo, index) => (
                              <div
                                key={index}
                                className="relative group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                                onClick={() => setSelectedImage(photo.url)}
                              >
                                <div className="relative">
                                  <img
                                    src={photo.url}
                                    alt={photo.type || "Uploaded photo"}
                                    className="w-full aspect-square object-cover rounded-md group-hover:opacity-70 transition-opacity duration-300"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="bg-black bg-opacity-50 rounded-full p-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </div>
                                  </div>
                                  <span 
                                    className={`absolute bottom-0 right-0 w-20 px-2 py-1 text-sm text-center text-white ${
                                      photo.type?.toLowerCase() === 'before' 
                                        ? 'bg-gray-500' 
                                        : 'bg-green-600'
                                    }`}
                                  >
                                    {photo.type || "No type"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Image Modal */}
                          {selectedImage && (
                            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
                              <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
                                <img
                                  src={selectedImage}
                                  alt="Preview"
                                  className="max-w-full max-h-[80vh] mx-auto"
                                />
                                <button
                                  onClick={() => setSelectedImage(null)}
                                  className="absolute -top-10 right-0 text-white hover:text-gray-300"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Report</h3>
                      <p className="text-gray-500 dark:text-gray-400">Choose a report from the list to view details</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-t border-white/20 px-6 py-4 z-50">
          <div className="flex items-center justify-around">
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-200 text-gray-400 hover:text-blue-500"
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">Dashboard</span>
            </button>
            <button 
              onClick={() => router.push('/tasks')}
              className="flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-200 text-gray-400 hover:text-blue-500"
            >
              <List className="w-6 h-6" />
              <span className="text-xs font-medium">Tasks</span>
            </button>
            <button 
              className="flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-200 text-blue-600 bg-blue-100 dark:bg-blue-900/30"
            >
              <FileText className="w-6 h-6" />
              <span className="text-xs font-medium">Reports</span>
            </button>
            <button 
              onClick={() => router.push('/profile')}
              className="flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-200 text-gray-400 hover:text-blue-500"
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
