'use client';

import React, { useState, useEffect } from 'react';
import { adminApiService } from '../../services/api';
import { useTheme } from '@/components/ThemeProvider';
import { connectAdminWebSocket } from '../../services/websocket';

interface WorkflowJob {
  job_id: string;
  state: string;
  current_room?: string;
  completed_tasks: number;
  critical_tasks: number;
  notes: number;
  before_photos: number;
  after_photos: number;
  created_at: string;
  updated_at: string;
}

export default function WorkflowPage() {
  const { theme } = useTheme();
  const [workflowJobs, setWorkflowJobs] = useState<WorkflowJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<WorkflowJob | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadWorkflowData();
    connectToWebSocket();
  }, []);

  const loadWorkflowData = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, create some sample workflow jobs
      const sampleJobs: WorkflowJob[] = [
        {
          job_id: '12345',
          state: 'in_progress',
          current_room: 'Living Room',
          completed_tasks: 3,
          critical_tasks: 5,
          notes: 2,
          before_photos: 2,
          after_photos: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          job_id: '12346',
          state: 'completed',
          current_room: 'Kitchen',
          completed_tasks: 5,
          critical_tasks: 5,
          notes: 3,
          before_photos: 3,
          after_photos: 3,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          job_id: '12347',
          state: 'pending',
          current_room: undefined,
          completed_tasks: 0,
          critical_tasks: 4,
          notes: 0,
          before_photos: 0,
          after_photos: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setWorkflowJobs(sampleJobs);
    } catch (error) {
      console.error('Error loading workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectToWebSocket = () => {
    connectAdminWebSocket('admin_user', {
      onOpen: () => setIsConnected(true),
      onClose: () => setIsConnected(false),
      onMessage: (message) => {
        if (message.type === 'sms_workflow_update') {
          // Update workflow jobs with real-time data
          setWorkflowJobs(prev => {
            const existingJob = prev.find(job => job.job_id === message.job_id);
            if (existingJob) {
              return prev.map(job => 
                job.job_id === message.job_id 
                  ? { ...job, state: message.state, updated_at: new Date().toISOString() }
                  : job
              );
            } else {
              // Add new job if it doesn't exist
              return [...prev, {
                job_id: message.job_id,
                state: message.state,
                completed_tasks: 0,
                critical_tasks: 0,
                notes: 0,
                before_photos: 0,
                after_photos: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }];
            }
          });
        }
      }
    });
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">SMS Workflow Monitoring</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor cleaning jobs managed through SMS workflow
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm">{isConnected ? 'Live Updates' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}`}>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Jobs</h3>
          <p className="text-2xl font-bold text-blue-600">
            {workflowJobs.filter(job => job.state === 'in_progress').length}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-green-50'}`}>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</h3>
          <p className="text-2xl font-bold text-green-600">
            {workflowJobs.filter(job => job.state === 'completed').length}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-yellow-50'}`}>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {workflowJobs.filter(job => job.state === 'pending').length}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-purple-50'}`}>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Photos</h3>
          <p className="text-2xl font-bold text-purple-600">
            {workflowJobs.reduce((sum, job) => sum + job.before_photos + job.after_photos, 0)}
          </p>
        </div>
      </div>

      {/* Workflow Jobs */}
      <div className={`rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className="text-lg font-semibold">Workflow Jobs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Photos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {workflowJobs.map((job) => {
                const progressPercentage = getProgressPercentage(job.completed_tasks, job.critical_tasks);
                return (
                  <tr 
                    key={job.job_id} 
                    className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{job.job_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(job.state)}`}>
                        {job.state.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">{progressPercentage}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {job.completed_tasks}/{job.critical_tasks} tasks
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.current_room || 'Not started'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Before: {job.before_photos}</div>
                      <div>After: {job.after_photos}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.updated_at).toLocaleTimeString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} max-w-2xl w-full mx-4`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Job Details - {selectedJob.job_id}</h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                <p className="text-sm">{selectedJob.state}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Room</label>
                <p className="text-sm">{selectedJob.current_room || 'Not started'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasks Completed</label>
                <p className="text-sm">{selectedJob.completed_tasks}/{selectedJob.critical_tasks}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</label>
                <p className="text-sm">{selectedJob.notes}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Before Photos</label>
                <p className="text-sm">{selectedJob.before_photos}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">After Photos</label>
                <p className="text-sm">{selectedJob.after_photos}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Created: {new Date(selectedJob.created_at).toLocaleString()}</span>
                <span>Updated: {new Date(selectedJob.updated_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 