'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Star, Clock, MapPin, Building, FileText, Calendar } from 'lucide-react';
import { apiService } from '../services/apiService';

interface TaskResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  propertyName: string;
  propertyAddress: string;
  taskData?: any; // Add task data for fallback information
}

interface Photo {
  _id: string;
  url: string;
  type: 'before' | 'during' | 'after';
  uploadedAt: string;
  tags?: string[];
  notes?: string;
}

interface Issue {
  _id: string;
  type: string;
  description: string;
  location?: string;
  notes?: string;
  isResolved: boolean;
  resolvedAt?: string;
  createdAt: string;
}

interface AIFeedback {
  _id: string;
  feedback: string;
  improvements?: string[];
  confidence: number;
  suggestions?: string[];
  createdAt: string;
}

interface ScoringData {
  overallScore: number;
  manualComplianceScore: number;
  improvements: string[];
  missedRequirements: string[];
  reWorkAreas: string[];
  qualityBreakdown: {
    surfaceCleaning: number;
    detailWork: number;
    manualCompliance: number;
  };
  meetsManualStandards: boolean;
  detailedScoring: {
    finalScore: number;
    grade: string;
    meetsStandards: boolean;
    qualityMetrics: {
      surfaceCleaning: number;
      detailWork: number;
      manualCompliance: number;
      overallQuality: number;
    };
    manualComplianceBreakdown: {
      totalRequirements: number;
      requirementsMet: number;
      requirementsMissed: number;
      compliancePercentage: number;
      detailedCompliance: Record<string, boolean>;
    };
  };
  recommendations: Array<{
    type: 'critical' | 'warning' | 'info' | 'success';
    title: string;
    description: string;
    action: string;
  }>;
}

export default function TaskResultModal({ 
  isOpen, 
  onClose, 
  taskId, 
  propertyName, 
  propertyAddress,
  taskData 
}: TaskResultModalProps) {
  const [loading, setLoading] = useState(false);
  const [scoringData, setScoringData] = useState<ScoringData | null>(null);
  const [taskDetails, setTaskDetails] = useState<any>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && taskId) {
      loadTaskResults();
    }
  }, [isOpen, taskId]);

  const loadTaskResults = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Loading task results for taskId:', taskId);
      
      // Load scoring data
      const scoringResponse = await apiService.getScoringHistory(taskId);
      console.log('Scoring API response:', scoringResponse);
      
      if (scoringResponse.success && scoringResponse.data) {
        setScoringData(scoringResponse.data);
      } else {
        // No scoring data available - this is normal for older tasks
        setScoringData(null);
      }

      // Load full task details including photos, issues, and AI feedback
      const taskResponse = await apiService.getTask(taskId);
      console.log('Task API response:', taskResponse);
      
      if (taskResponse.success && taskResponse.data) {
        setTaskDetails(taskResponse.data);
        setPhotos(taskResponse.data.photos || []);
        setIssues(taskResponse.data.issues || []);
        setAiFeedback(taskResponse.data.aiFeedback || []);
      }
    } catch (error) {
      console.error('Error loading task results:', error);
      setError('Failed to load task results. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'stain': return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
      case 'crack': return <div className="w-3 h-3 bg-orange-500 rounded-full"></div>;
      case 'damage': return <div className="w-3 h-3 bg-red-600 rounded-full"></div>;
      case 'maintenance': return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>;
      default: return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
    }
  };

  const getPhotoTypeColor = (type: string) => {
    switch (type) {
      case 'before': return 'bg-blue-100 text-blue-800';
      case 'during': return 'bg-yellow-100 text-yellow-800';
      case 'after': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Task Results
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              {propertyName} • {propertyAddress}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading task results...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={loadTaskResults}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="block w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : scoringData ? (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Overall Performance
                  </h3>
                  <div className={`px-4 py-2 rounded-full font-bold text-lg ${getGradeColor(scoringData.detailedScoring.grade)}`}>
                    {scoringData.detailedScoring.grade}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {scoringData.detailedScoring.finalScore}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Final Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {scoringData.qualityBreakdown.surfaceCleaning}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Surface Cleaning</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {scoringData.qualityBreakdown.detailWork}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Detail Work</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {scoringData.qualityBreakdown.manualCompliance}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Compliance</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center">
                  {scoringData.meetsManualStandards ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Meets Quality Standards</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">Below Quality Standards</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Compliance Breakdown */}
              <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Manual Compliance
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {scoringData.detailedScoring.manualComplianceBreakdown.requirementsMet}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Requirements Met</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {scoringData.detailedScoring.manualComplianceBreakdown.requirementsMissed}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Requirements Missed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {scoringData.detailedScoring.manualComplianceBreakdown.compliancePercentage}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Compliance Rate</div>
                  </div>
                </div>

                {scoringData.missedRequirements.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-red-600 mb-2">Missed Requirements:</h4>
                    <ul className="space-y-1">
                      {scoringData.missedRequirements.map((requirement, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {scoringData.recommendations.length > 0 && (
                <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Recommendations
                  </h3>
                  
                  <div className="space-y-3">
                    {scoringData.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-600">
                        {getRecommendationIcon(rec.type)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {rec.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {rec.description}
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            <strong>Action:</strong> {rec.action}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements */}
              {scoringData.improvements.length > 0 && (
                <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Areas for Improvement
                  </h3>
                  
                  <div className="space-y-2">
                    {scoringData.improvements.map((improvement, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-gray-700 dark:text-gray-300">{improvement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Real Task Completion Info */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Task Completed Successfully
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      All assigned tasks have been completed
                    </p>
                  </div>
                </div>
                
                {taskData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {taskData.requirements?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Total Rooms</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {taskData.requirements?.filter((req: any) => req.isCompleted)?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Completed Rooms</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {taskData.requirements?.length > 0 
                          ? Math.round((taskData.requirements.filter((req: any) => req.isCompleted).length / taskData.requirements.length) * 100)
                          : 0}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Completion Rate</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Room-by-Room Breakdown */}
              {taskData?.requirements && taskData.requirements.length > 0 && (
                <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Room Completion Details
                  </h3>
                  <div className="space-y-3">
                    {taskData.requirements.map((requirement: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${requirement.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="font-medium text-gray-900 dark:text-white capitalize">
                            {requirement.roomType?.replace('_', ' ') || `Room ${index + 1}`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {requirement.isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                          )}
                          <span className={`text-sm font-medium ${requirement.isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                            {requirement.isCompleted ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Task Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{propertyName}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{propertyAddress}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Task ID: {taskId.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  {taskData?.scheduledTime && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Scheduled: {new Date(taskData.scheduledTime).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  About Task Results
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  This task was completed successfully. For tasks completed with the latest version of the system, 
                  you'll see detailed quality scoring, compliance metrics, and improvement recommendations.
                </p>
              </div>

              {/* Photos Section */}
              {photos.length > 0 && (
                <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Task Photos ({photos.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {photos.map((photo) => (
                      <div key={photo._id} className="bg-gray-50 dark:bg-gray-600 rounded-lg p-3">
                        <div className="aspect-square bg-gray-200 dark:bg-gray-500 rounded-lg mb-2 flex items-center justify-center">
                          <img 
                            src={photo.url} 
                            alt={`${photo.type} photo`}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTM1IDM1SDY1VjY1SDM1VjM1WiIgZmlsbD0iI0YzRjRGNiIvPgo8L3N2Zz4K';
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhotoTypeColor(photo.type)}`}>
                            {photo.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(photo.uploadedAt)}
                          </span>
                        </div>
                        {photo.notes && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                            {photo.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues Section */}
              {issues.length > 0 && (
                <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Issues Found ({issues.length})
                  </h3>
                  <div className="space-y-3">
                    {issues.map((issue) => (
                      <div key={issue._id} className={`p-4 rounded-lg border-l-4 ${
                        issue.isResolved 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                          : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            {getIssueIcon(issue.type)}
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                                {issue.type}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {issue.description}
                              </p>
                              {issue.location && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Location: {issue.location}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {issue.isResolved ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`text-xs font-medium ${
                              issue.isResolved ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {issue.isResolved ? 'Resolved' : 'Open'}
                            </span>
                          </div>
                        </div>
                        {issue.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                            Notes: {issue.notes}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>Reported: {formatDate(issue.createdAt)}</span>
                          {issue.resolvedAt && (
                            <span>Resolved: {formatDate(issue.resolvedAt)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Feedback Section */}
              {aiFeedback.length > 0 && (
                <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    AI Feedback ({aiFeedback.length})
                  </h3>
                  <div className="space-y-4">
                    {aiFeedback.map((feedback) => (
                      <div key={feedback._id} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              AI Analysis
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              Confidence: {Math.round(feedback.confidence * 100)}%
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(feedback.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {feedback.feedback}
                        </p>
                        
                        {feedback.improvements && feedback.improvements.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                              Improvements:
                            </h5>
                            <ul className="space-y-1">
                              {feedback.improvements.map((improvement, index) => (
                                <li key={index} className="text-xs text-gray-600 dark:text-gray-300 flex items-start">
                                  <span className="text-blue-500 mr-2 mt-1">•</span>
                                  {improvement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {feedback.suggestions && feedback.suggestions.length > 0 && (
                          <div>
                            <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                              Suggestions:
                            </h5>
                            <ul className="space-y-1">
                              {feedback.suggestions.map((suggestion, index) => (
                                <li key={index} className="text-xs text-gray-600 dark:text-gray-300 flex items-start">
                                  <span className="text-green-500 mr-2 mt-1">•</span>
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
