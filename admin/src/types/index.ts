export interface Task {
  id: string;
  title: string;
  description: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  dueDate: string;
  estimatedDuration: number; // in minutes
  instructions: string[];
  beforePhotos: string[];
  afterPhotos: string[];
  aiAnalysis?: {
    issues: string[];
    recommendations: string[];
    score: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  ownerName: string;
  propertyType: 'apartment' | 'house' | 'office' | 'commercial';
  size: number; // in sq ft
  rooms: number;
  bathrooms: number;
  specialInstructions: string;
  accessCode?: string;
  keyLocation?: string;
  photos: string[];
}

export interface Cleaner {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  rating: number;
  totalTasks: number;
  completedTasks: number;
  specialties: string[];
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
}

export interface PhotoAnalysis {
  id: string;
  taskId: string;
  photoUrl: string;
  photoType: 'before' | 'after';
  analysis: {
    cleanliness: number; // 0-100
    issues: string[];
    recommendations: string[];
    aiScore: number;
  };
  uploadedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'ai' | 'system' | 'urgent';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'cleaner' | 'supervisor' | 'admin';
  avatar?: string;
  phone: string;
  isOnline: boolean;
  lastActive: string;
} 