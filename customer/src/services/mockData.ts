import { Task, Property, Cleaner, Notification, User } from '../types';

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Deep Clean - Living Room & Kitchen',
    description: 'Complete deep cleaning of living room and kitchen areas including appliances',
    propertyId: '1',
    propertyName: 'Sunset Apartments - Unit 3B',
    propertyAddress: '123 Sunset Blvd, Los Angeles, CA',
    status: 'in-progress',
    priority: 'high',
    assignedTo: 'cleaner1',
    dueDate: '2024-07-30T18:00:00Z',
    estimatedDuration: 120,
    instructions: [
      'Start with kitchen appliances (refrigerator, oven, microwave)',
      'Clean all surfaces with eco-friendly products',
      'Vacuum and mop floors',
      'Dust all surfaces and light fixtures',
      'Take before/after photos for each area'
    ],
    beforePhotos: [],
    afterPhotos: [],
    createdAt: '2024-07-30T08:00:00Z',
    updatedAt: '2024-07-30T10:30:00Z'
  },
  {
    id: '2',
    title: 'Regular Maintenance - Bathroom',
    description: 'Standard bathroom cleaning and sanitization',
    propertyId: '2',
    propertyName: 'Ocean View Condo - Unit 7A',
    propertyAddress: '456 Ocean Drive, Miami, FL',
    status: 'pending',
    priority: 'medium',
    assignedTo: 'cleaner1',
    dueDate: '2024-07-31T16:00:00Z',
    estimatedDuration: 60,
    instructions: [
      'Clean toilet, sink, and shower thoroughly',
      'Replace towels and toiletries',
      'Sanitize all surfaces',
      'Check for any maintenance issues'
    ],
    beforePhotos: [],
    afterPhotos: [],
    createdAt: '2024-07-30T09:00:00Z',
    updatedAt: '2024-07-30T09:00:00Z'
  },
  {
    id: '3',
    title: 'Move-out Cleaning - Entire Unit',
    description: 'Complete move-out cleaning for 2-bedroom apartment',
    propertyId: '3',
    propertyName: 'Downtown Lofts - Unit 12C',
    propertyAddress: '789 Main Street, New York, NY',
    status: 'completed',
    priority: 'high',
    assignedTo: 'cleaner1',
    dueDate: '2024-07-29T17:00:00Z',
    estimatedDuration: 180,
    instructions: [
      'Deep clean all rooms',
      'Clean inside all appliances',
      'Wash windows and mirrors',
      'Clean carpets and floors',
      'Final inspection required'
    ],
    beforePhotos: ['photo1.jpg', 'photo2.jpg'],
    afterPhotos: ['photo3.jpg', 'photo4.jpg'],
    aiAnalysis: {
      issues: ['Minor stain on carpet', 'Dust on ceiling fan'],
      recommendations: ['Use carpet cleaner for stain', 'Clean ceiling fan'],
      score: 85
    },
    createdAt: '2024-07-29T08:00:00Z',
    updatedAt: '2024-07-29T17:30:00Z'
  }
];

export const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Sunset Apartments - Unit 3B',
    address: '123 Sunset Blvd, Los Angeles, CA',
    ownerId: 'owner1',
    ownerName: 'Sarah Johnson',
    propertyType: 'apartment',
    size: 1200,
    rooms: 2,
    bathrooms: 1,
    specialInstructions: 'Use eco-friendly products only. Pet-friendly unit.',
    accessCode: '1234',
    keyLocation: 'Under doormat',
    photos: ['property1_1.jpg', 'property1_2.jpg']
  },
  {
    id: '2',
    name: 'Ocean View Condo - Unit 7A',
    address: '456 Ocean Drive, Miami, FL',
    ownerId: 'owner2',
    ownerName: 'Michael Chen',
    propertyType: 'apartment',
    size: 1500,
    rooms: 3,
    bathrooms: 2,
    specialInstructions: 'Be careful with marble surfaces. No shoes inside.',
    accessCode: '5678',
    keyLocation: 'Lockbox - code 5678',
    photos: ['property2_1.jpg', 'property2_2.jpg']
  }
];

export const mockUser: User = {
  id: 'cleaner1',
  name: 'Maria Rodriguez',
  email: 'maria.rodriguez@propertysanta.com',
  role: 'cleaner',
  avatar: 'https://example.com/avatar.jpg',
  phone: '+1-555-0123',
  isOnline: true,
  lastActive: new Date().toISOString()
};

export const mockCleaner: Cleaner = {
  id: 'cleaner1',
  name: 'Maria Rodriguez',
  email: 'maria.rodriguez@propertysanta.com',
  phone: '+1-555-0123',
  avatar: 'https://example.com/avatar.jpg',
  rating: 4.8,
  totalTasks: 156,
  completedTasks: 152,
  specialties: ['Deep Cleaning', 'Eco-friendly', 'Move-out Cleaning'],
  availability: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  },
  currentLocation: {
    latitude: 34.0522,
    longitude: -118.2437,
    timestamp: new Date().toISOString()
  }
};

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Task Assigned',
    message: 'You have been assigned a new task at Sunset Apartments',
    type: 'task',
    read: false,
    createdAt: new Date().toISOString(),
    actionUrl: '/task/1'
  },
  {
    id: '2',
    title: 'AI Analysis Complete',
    message: 'AI has analyzed your photos for Task #3',
    type: 'ai',
    read: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    actionUrl: '/task/3'
  },
  {
    id: '3',
    title: 'Task Reminder',
    message: 'Task #2 is due in 2 hours',
    type: 'urgent',
    read: false,
    createdAt: new Date().toISOString(),
    actionUrl: '/task/2'
  }
]; 