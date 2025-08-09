import { Task, Photo, Issue, AIFeedback } from '../types';
import { mockTasks, mockIssues, mockAIFeedback } from './mockData';

class TaskService {
  private tasks: Task[] = [...mockTasks];
  private issues: Issue[] = [...mockIssues];
  private aiFeedback: AIFeedback[] = [...mockAIFeedback];

  // Simulate API delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get all tasks for cleaner
  async getTasks(): Promise<Task[]> {
    console.log('Fetching tasks for cleaner');
    await this.delay(800);
    return this.tasks;
  }

  // Get task by ID
  async getTaskById(taskId: string): Promise<Task | null> {
    console.log('Fetching task:', taskId);
    await this.delay(500);
    return this.tasks.find(task => task.id === taskId) || null;
  }

  // Update task status
  async updateTaskStatus(taskId: string, status: Task['status']): Promise<Task> {
    console.log('Updating task status:', taskId, 'to', status);
    await this.delay(1000);

    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      status,
      updatedAt: new Date().toISOString()
    };

    return this.tasks[taskIndex];
  }

  // Upload photo
  async uploadPhoto(taskId: string, photoData: {
    type: Photo['type'];
    localPath: string;
    notes?: string;
    tags?: string[];
  }): Promise<Photo> {
    console.log('Uploading photo for task:', taskId);
    await this.delay(2000); // Simulate upload time

    const photo: Photo = {
      id: `photo-${Date.now()}`,
      taskId,
      url: `https://example.com/photos/${photoData.localPath}`,
      type: photoData.type,
      uploadedAt: new Date().toISOString(),
      isUploaded: true,
      localPath: photoData.localPath,
      notes: photoData.notes,
      tags: photoData.tags || []
    };

    // Add photo to task
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      if (!this.tasks[taskIndex].photos) {
        this.tasks[taskIndex].photos = [];
      }
      this.tasks[taskIndex].photos!.push(photo);
    }

    return photo;
  }

  // Report issue
  async reportIssue(taskId: string, issueData: {
    type: Issue['type'];
    description: string;
    severity: Issue['severity'];
    location?: string;
    notes?: string;
    photoId?: string;
  }): Promise<Issue> {
    console.log('Reporting issue for task:', taskId);
    await this.delay(1000);

    const issue: Issue = {
      id: `issue-${Date.now()}`,
      taskId,
      type: issueData.type,
      description: issueData.description,
      severity: issueData.severity,
      location: issueData.location,
      notes: issueData.notes,
      photoId: issueData.photoId,
      createdAt: new Date().toISOString(),
      isResolved: false
    };

    // Add issue to task
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      if (!this.tasks[taskIndex].issues) {
        this.tasks[taskIndex].issues = [];
      }
      this.tasks[taskIndex].issues!.push(issue);
    }

    this.issues.push(issue);

    return issue;
  }

  // Get AI feedback for task
  async getAIFeedback(taskId: string): Promise<AIFeedback[]> {
    console.log('Fetching AI feedback for task:', taskId);
    await this.delay(1000);
    return this.aiFeedback.filter(feedback => feedback.taskId === taskId);
  }

  // Mark AI feedback as resolved
  async resolveAIFeedback(feedbackId: string): Promise<AIFeedback> {
    console.log('Resolving AI feedback:', feedbackId);
    await this.delay(500);

    const feedbackIndex = this.aiFeedback.findIndex(f => f.id === feedbackId);
    if (feedbackIndex === -1) {
      throw new Error('AI feedback not found');
    }

    this.aiFeedback[feedbackIndex] = {
      ...this.aiFeedback[feedbackIndex],
      isResolved: true,
      resolvedAt: new Date().toISOString()
    };

    return this.aiFeedback[feedbackIndex];
  }

  // Get tasks by status
  async getTasksByStatus(status: Task['status']): Promise<Task[]> {
    console.log('Fetching tasks with status:', status);
    await this.delay(500);
    return this.tasks.filter(task => task.status === status);
  }

  // Get pending tasks
  async getPendingTasks(): Promise<Task[]> {
    return this.getTasksByStatus('pending');
  }

  // Get in-progress tasks
  async getInProgressTasks(): Promise<Task[]> {
    return this.getTasksByStatus('in_progress');
  }

  // Get completed tasks
  async getCompletedTasks(): Promise<Task[]> {
    return this.getTasksByStatus('completed');
  }

  // Get tasks needing follow-up
  async getTasksNeedingFollowUp(): Promise<Task[]> {
    return this.getTasksByStatus('needs_followup');
  }

  // Get issues for task
  async getTaskIssues(taskId: string): Promise<Issue[]> {
    console.log('Fetching issues for task:', taskId);
    await this.delay(500);
    return this.issues.filter(issue => issue.taskId === taskId);
  }

  // Resolve issue
  async resolveIssue(issueId: string): Promise<Issue> {
    console.log('Resolving issue:', issueId);
    await this.delay(500);

    const issueIndex = this.issues.findIndex(issue => issue.id === issueId);
    if (issueIndex === -1) {
      throw new Error('Issue not found');
    }

    this.issues[issueIndex] = {
      ...this.issues[issueIndex],
      isResolved: true,
      resolvedAt: new Date().toISOString()
    };

    return this.issues[issueIndex];
  }

  // Offline sync (simulate)
  async syncOfflineData(): Promise<{
    photosUploaded: number;
    issuesReported: number;
    statusUpdates: number;
  }> {
    console.log('Syncing offline data');
    await this.delay(2000);

    // Simulate sync results
    return {
      photosUploaded: 3,
      issuesReported: 1,
      statusUpdates: 2
    };
  }

  // Check network connectivity
  async checkConnectivity(): Promise<boolean> {
    // In real app, check actual network status
    return Math.random() > 0.1; // 90% chance of being online
  }
}

export const taskService = new TaskService();
export default taskService; 