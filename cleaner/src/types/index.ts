export interface Task {
  id: string;
  title: string;
  description: string;
  property: string;
  status: 'pending' | 'in_progress' | 'completed' | 'needs_followup';
  estimatedTime: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  instructions?: string;
  address: string;
  scheduledTime?: string;
  startedAt?: string;
  completedAt?: string;
  actualTime?: string;
  notes?: string;
  photos?: Photo[];
  issues?: Issue[];
  aiFeedback?: AIFeedback[];
}

export interface RoomTask {
  roomType: 'bedroom' | 'bathroom' | 'kitchen' | 'living_room' | 'dining_room' | 'office' | 'laundry' | 'other';
  tasks: {
    description: string;
    isCompleted: boolean;
    specialNotes?: string;
    estimatedTime?: string;
  }[];
  specialInstructions: string[];
  fragileItems: string[];
}

export interface Property {
  _id: string;
  propertyId: string;
  name: string;
  address: string;
  type: 'apartment' | 'house' | 'office';
  rooms: number;
  bathrooms: number;
  squareFootage: number;
  estimatedTime: string;
  manual: {
    title: string;
    content: string;
    lastUpdated: string;
  };
  roomTasks: RoomTask[];
  instructions?: string;
  specialRequirements?: string[];
  owner?: {
    name: string;
    email: string;
    phone: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cleaner {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
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
}

export interface Photo {
  id: string;
  taskId: string;
  url: string;
  type: 'before' | 'during' | 'after';
  uploadedAt: string;
  isUploaded: boolean;
  localPath?: string;
  tags?: string[];
  notes?: string;
  voiceNotes?: string;
}

export interface Issue {
  id: string;
  taskId: string;
  type: 'stain' | 'crack' | 'weed' | 'damage' | 'maintenance' | 'other';
  description: string;
  photoId?: string;
  severity: 'low' | 'medium' | 'high';
  location?: string;
  notes?: string;
  voiceNotes?: string;
  createdAt: string;
  isResolved: boolean;
  resolvedAt?: string;
}

export interface AIFeedback {
  id: string;
  taskId: string;
  photoId?: string;
  issueId?: string;
  feedback: string;
  confidence: number;
  suggestions: string[];
  isResolved: boolean;
  resolvedAt?: string;
  createdAt: string;
}

export interface PhotoAnalysis {
  id: string;
  taskId: string;
  photoUrl: string;
  analysis: {
    cleanliness: number;
    issues: string[];
    recommendations: string[];
  };
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'cleaner' | 'customer' | 'admin';
  avatar?: string;
  rating: number;
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
  isActive: boolean;
  lastLogin?: string;
  otp?: string;
  otpExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loginMethod?: 'password' | 'otp';
  error?: string;
}

export interface OfflineData {
  pendingPhotos: Photo[];
  pendingIssues: Issue[];
  pendingStatusUpdates: { taskId: string; status: string }[];
  lastSync: string;
}

export interface OTPRequest {
  email: string;
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  otp?: string;
} 