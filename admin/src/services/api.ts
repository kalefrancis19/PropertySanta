import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('API_BASE_URL:', API_BASE_URL);

// Get token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

// Property types based on your backend schema
export interface Property {
  _id: string;
  propertyId: string;
  name: string;
  address: string;
  type: 'apartment' | 'house' | 'office';
  squareFootage: number;
  cycle?: string;
  isActive: boolean;
  customer?: string;
  roomTasks: Array<{
    roomType: string;
    tasks: Array<{
      description: string;
      isCompleted: boolean;
      Regular?: string;
    }>;
  }>;
  createdAt?: string;
  updatedAt?: string;
  customer?: string;
}

export interface CreatePropertyRequest {
  propertyId: string;
  name: string;
  address: string;
  type: 'apartment' | 'house' | 'office';
  squareFootage: number;
  cycle?: string;
  isActive?: boolean;
  customer?: string;  
  roomTasks: Array<{
    roomType: string;
    tasks: Array<{
      description: string;
      isCompleted?: boolean;
      Regular?: string;
    }>;
  }>;
}

export interface UpdatePropertyRequest {
  name?: string;
  propertyId?: string;
  address?: string;
  type?: 'apartment' | 'house' | 'office';
  squareFootage?: number;
  cycle?: string;
  customer?: string;  
  isActive?: boolean;
  roomTasks?: Array<{
    roomType: string;
    tasks: Array<{
      description: string;
      isCompleted?: boolean;
      Regular?: string;
    }>;
  }>;
}

// Property API functions
export const propertyAPI = {
  // Get all properties
  getAll: async (): Promise<Property[]> => {
    try {
      const response = await api.get('/properties');
      return response.data.properties || [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  // Get property by ID
  getById: async (id: string): Promise<Property> => {
    try {
      const response = await api.get(`/properties/${id}`);
      return response.data.property;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  },

  // Create new property
  create: async (property: CreatePropertyRequest): Promise<Property> => {
    try {
      const response = await api.post('/properties', property);
      return response.data.property;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  // Update property
  update: async (id: string, property: UpdatePropertyRequest): Promise<Property> => {
    try {
      const response = await api.put(`/properties/${id}`, property);
      return response.data.property;
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  },

  // Delete property
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/properties/${id}`);
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  },

  // Update property manual
  updateManual: async (id: string, manual: { title: string; content: string }): Promise<Property> => {
    try {
      const response = await api.patch(`/properties/${id}/manual`, { manual });
      return response.data.property;
    } catch (error) {
      console.error('Error updating property manual:', error);
      throw error;
    }
  },

  // Get property manual
  getManual: async (id: string): Promise<{ title: string; content: string }> => {
    try {
      const response = await api.get(`/properties/${id}/manual`);
      return response.data.manual;
    } catch (error) {
      console.error('Error fetching property manual:', error);
      throw error;
    }
  }
};

// Task types and API
export interface TaskRequirement {
  roomType: string;
  tasks: Array<{
    description: string;
    isCompleted: boolean;
  }>;
  isCompleted: boolean;
}

export interface Photo {
  _id: string;
  url: string;
  type: 'before' | 'during' | 'after';
  uploadedBy: string | { _id: string; name: string };
  uploadedAt: Date;
  isUploaded: boolean;
  localPath?: string;
  tags?: string[];
  notes?: string;
}

export interface Issue {
  _id: string;
  type: string;
  description: string;
  photoId?: string;
  location?: string;
  notes?: string;
  reportedBy: string | { _id: string; name: string };
  isResolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIFeedback {
  photoId: string;
  issueId?: string;
  feedback: string;
  improvements: string[];
  confidence: number;
  suggestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  _id: string;
  propertyId: string;
  requirements: TaskRequirement[];
  specialRequirement?: string;
  scheduledTime?: Date;
  assignedTo?: string | { _id: string; name: string; email: string };
  photos: Photo[];
  issues: Issue[];
  aiFeedback: AIFeedback[];
  chatHistory?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskRequest {
  propertyId: string;
  requirements: Array<{
    roomType: string;
    tasks: Array<{
      description: string;
    }>;
  }>;
  specialRequirement?: string;
  scheduledTime?: Date | string;
  assignedTo?: string;
  isActive?: boolean;
}

export interface UpdateTaskRequest {
  requirements?: TaskRequirement[];
  specialRequirement?: string;
  scheduledTime?: Date | string;
  assignedTo?: string;
  isActive?: boolean;
}

export interface AddPhotoRequest {
  url: string;
  type: 'before' | 'during' | 'after';
  tags?: string[];
  notes?: string;
}

export interface AddIssueRequest {
  type: string;
  description: string;
  location?: string;
  notes?: string;
  photoId?: string;
}

export const taskAPI = {
  // Get all tasks (admin only)
  async getAll(filters: { propertyId?: string; isActive?: boolean } = {}): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters.propertyId) params.append('propertyId', filters.propertyId);
    if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
    
    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data.data;
  },

  // Get task by ID
  async getById(id: string): Promise<Task> {
    const response = await api.get(`/tasks/${id}`);
    return response.data.data;
  },

  // Create new task (admin only)
  async create(task: CreateTaskRequest): Promise<Task> {
    const response = await api.post('/tasks', task);
    return response.data.data;
  },

  // Update task (admin only)
  async update(id: string, updates: UpdateTaskRequest): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, updates);
    return response.data.data;
  },

  // Delete task (admin only)
  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  // Add photo to task
  async addPhoto(taskId: string, photo: AddPhotoRequest): Promise<Photo> {
    const response = await api.post(`/tasks/${taskId}/photos`, photo);
    return response.data.data;
  },

  // Add issue to task
  async addIssue(taskId: string, issue: AddIssueRequest): Promise<Issue> {
    const response = await api.post(`/tasks/${taskId}/issues`, issue);
    return response.data.data;
  },

  // Update requirement task status
  async updateRequirementStatus(
    taskId: string, 
    reqIndex: number, 
    taskIndex: number, 
    isCompleted: boolean
  ): Promise<TaskRequirement> {
    const response = await api.put(
      `/tasks/${taskId}/requirements/${reqIndex}/tasks/${taskIndex}`,
      { isCompleted }
    );
    return response.data.data;
  }
};

// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'cleaner' | 'customer';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'admin' | 'cleaner' | 'customer';
  isActive?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: 'admin' | 'cleaner' | 'customer';
  isActive?: boolean;
}

// User API functions
export const userAPI = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Create new user
  create: async (user: CreateUserRequest): Promise<User> => {
    try {
      const response = await api.post('/users', user);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  update: async (id: string, user: UpdateUserRequest): Promise<User> => {
    try {
      const response = await api.put(`/users/${id}`, user);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Toggle user active status
  toggleStatus: async (id: string, isActive: boolean): Promise<User> => {
    try {
      const response = await api.put(`/users/${id}`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },
};

export default api;