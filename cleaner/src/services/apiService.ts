const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// New interfaces for AI workflow
interface BeforeAfterScoringData {
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

interface WorkflowGuidanceData {
  nextPriority: string;
  workflow: string[];
  manualTips: string[];
  qualityCheckpoints: string[];
  estimatedTime: string;
  safetyReminders: string[];
  toolsNeeded: string[];
}

interface ManualRequirementsData {
  roomType: string;
  tasks: Array<{
    description: string;
    estimatedTime: string;
    specialNotes?: string;
    isCompleted: boolean;
  }>;
  specialInstructions: string[];
  fragileItems: string[];
}

interface PhotoAnalysisData {
  manualCompliance: number;
  requirementsMet: string[];
  requirementsMissed: string[];
  cleanlinessScore: number;
  nextSteps: string[];
  confidence: number;
  acceptableProgress: boolean;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Request failed',
        };
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        message: 'Network error',
      };
    }
  }

  // Auth endpoints
  async signUp(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<ApiResponse> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async loginWithPassword(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async loginWithOTP(credentials: {
    email: string;
    otp: string;
  }): Promise<ApiResponse> {
    return this.request('/auth/login-otp', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async requestOTP(data: {
    email: string;
    phone?: string;
  }): Promise<ApiResponse> {
    return this.request('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.request('/auth/me');
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(): Promise<ApiResponse> {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  // Task endpoints
  async getTasks(): Promise<ApiResponse> {
    return this.request('/tasks');
  }

  async getPropertyDetails(propertyId: string): Promise<ApiResponse> {
    return this.request(`/tasks/property/${propertyId}`);
  }

  async updateRoomTaskStatus(propertyId: string, roomType: string, taskIndex: number, isCompleted: boolean): Promise<ApiResponse> {
    return this.request(`/tasks/property/${propertyId}/room-task`, {
      method: 'PATCH',
      body: JSON.stringify({ roomType, taskIndex, isCompleted }),
    });
  }

  async updateTaskStatus(id: string, status: string): Promise<ApiResponse> {
    return this.request(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // AI endpoints - Updated for new workflow
  async chatWithAI(data: {
    message: string;
    propertyId?: string;
    roomType?: string;
    completedTasks?: string[];
    manualTips?: string[];
  }): Promise<ApiResponse> {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // New AI endpoints for manual-based workflow
  async scoreBeforeAfterPhotos(data: {
    beforePhotoBase64: string;
    afterPhotoBase64: string;
    roomType: string;
    propertyId: string;
    taskId: string;
  }): Promise<ApiResponse<BeforeAfterScoringData>> {
    return this.request('/ai/score-before-after', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async analyzeBeforeAfterPhotos(data: {
    beforePhotoBase64: string;
    afterPhotoBase64: string;
    roomType: string;
    propertyId: string;
  }): Promise<ApiResponse> {
    return this.request('/ai/analyze-before-after', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async analyzePhotoWithManual(data: {
    photoBase64: string;
    photoType: 'before' | 'after' | 'during';
    roomType: string;
    propertyId: string;
  }): Promise<ApiResponse<PhotoAnalysisData>> {
    return this.request('/ai/analyze-photo-manual', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // New workflow endpoints
  async uploadPhotoWithWorkflow(data: {
    photoBase64: string;
    photoType: 'before' | 'after' | 'during';
    roomType: string;
    propertyId: string;
    userMessage?: string;
  }): Promise<ApiResponse<{
    message: string;
    shouldAnalyze: boolean;
    analysis?: PhotoAnalysisData;
    scoring?: BeforeAfterScoringData;
    workflowState: string;
    beforePhotosLogged: string[];
    afterPhotosLogged: string[];
    isCompleted?: boolean;
    error?: boolean;
  }>> {
    return this.request('/ai/upload-photo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWorkflowState(propertyId: string): Promise<ApiResponse<{
    workflowState: string;
    beforePhotosLogged: string[];
    afterPhotosLogged: string[];
    currentRoomIndex: number;
    chatHistory: Array<{
      message: string;
      sender: string;
      timestamp: Date;
    }>;
  }>> {
    return this.request(`/ai/workflow-state/${propertyId}`);
  }

  async resetWorkflow(data: {
    propertyId: string;
  }): Promise<ApiResponse> {
    return this.request('/ai/reset-workflow', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateWorkflowGuidance(data: {
    roomType: string;
    propertyId: string;
    currentProgress?: string;
  }): Promise<ApiResponse<WorkflowGuidanceData>> {
    return this.request('/ai/generate-workflow', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getManualRequirements(propertyId: string, roomType: string): Promise<ApiResponse<ManualRequirementsData>> {
    return this.request(`/ai/manual-requirements/${propertyId}/${roomType}`);
  }

  async getScoringHistory(taskId: string): Promise<ApiResponse> {
    return this.request(`/ai/scoring-history/${taskId}`);
  }

  async getPropertyScoringSummary(propertyId: string): Promise<ApiResponse> {
    return this.request(`/ai/property-scoring-summary/${propertyId}`);
  }

  async updateWorkflowProgress(data: {
    propertyId: string;
    roomType: string;
    progress: string;
  }): Promise<ApiResponse> {
    return this.request('/ai/update-workflow-progress', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Legacy photo analysis (kept for backward compatibility)
  async analyzePhoto(data: {
    photoBase64: string;
    photoType: 'before' | 'after' | 'during';
    roomType?: string;
    propertyId?: string;
  }): Promise<ApiResponse> {
    return this.request('/ai/analyze-photo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAIContext(data: {
    currentProperty?: any;
    currentRoom?: string;
    completedTasks?: string[];
    photos?: {
      before: string[];
      after: string[];
      during: string[];
    };
    manualTips?: string[];
    currentWorkflow?: string[];
  }): Promise<ApiResponse> {
    return this.request('/ai/update-context', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetAIContext(): Promise<ApiResponse> {
    return this.request('/ai/reset-context', {
      method: 'POST',
    });
  }

  async testTextAnalysis(userMessage: string): Promise<ApiResponse> {
    return this.request('/ai/test-text-analysis', {
      method: 'POST',
      body: JSON.stringify({ userMessage }),
    });
  }
}

export const apiService = new ApiService(); 