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
export interface Task {
  _id?: string;
  title: string;
  description: string;
  property: string;
  address: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimatedTime: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  instructions?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const taskAPI = {
  getAll: async (): Promise<Task[]> => {
    try {
      const response = await api.get('/tasks');
      return response.data.tasks || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  getByProperty: async (propertyId: string): Promise<Task[]> => {
    try {
      const response = await api.get(`/tasks/admin?property=${propertyId}`);
      return response.data.tasks || [];
    } catch (error) {
      console.error('Error fetching tasks for property:', error);
      throw error;
    }
  }
};

export default api; 