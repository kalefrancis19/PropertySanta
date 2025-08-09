import { Task, User, Cleaner, Notification, Property, Photo, Issue, AIFeedback } from '../types';

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Kitchen Deep Clean',
    description: 'Complete kitchen cleaning including appliances, countertops, and floors',
    property: '123 Main St, Apt 4B',
    address: '123 Main St, Apt 4B, New York, NY 10001',
    status: 'pending',
    estimatedTime: '2 hours',
    priority: 'high',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    instructions: 'Focus on grease removal from stovetop and inside oven. Clean refrigerator thoroughly.',
    scheduledTime: '2024-01-16T10:00:00Z',
    photos: [
      {
        id: 'photo1',
        taskId: '1',
        url: 'https://example.com/kitchen-before.jpg',
        type: 'before',
        uploadedAt: '2024-01-15T09:00:00Z',
        isUploaded: true,
        tags: ['kitchen', 'before'],
        notes: 'Kitchen before cleaning'
      }
    ],
    issues: [],
    aiFeedback: []
  },
  {
    id: '2',
    title: 'Bathroom Sanitization',
    description: 'Thorough bathroom cleaning and sanitization',
    property: '456 Oak Ave, Unit 7',
    address: '456 Oak Ave, Unit 7, Brooklyn, NY 11201',
    status: 'in_progress',
    estimatedTime: '1.5 hours',
    priority: 'medium',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    instructions: 'Pay special attention to grout lines and shower head. Use anti-bacterial cleaner.',
    scheduledTime: '2024-01-15T14:00:00Z',
    photos: [
      {
        id: 'photo2',
        taskId: '2',
        url: 'https://example.com/bathroom-before.jpg',
        type: 'before',
        uploadedAt: '2024-01-15T10:30:00Z',
        isUploaded: true,
        tags: ['bathroom', 'before'],
        notes: 'Bathroom before cleaning'
      }
    ],
    issues: [
      {
        id: 'issue1',
        taskId: '2',
        type: 'stain',
        description: 'Hard water stains on shower door',
        photoId: 'photo2',
        severity: 'medium',
        location: 'Shower door',
        notes: 'Will need special cleaner for hard water stains',
        createdAt: '2024-01-15T10:30:00Z',
        isResolved: false
      }
    ],
    aiFeedback: [
      {
        id: 'ai1',
        taskId: '2',
        issueId: 'issue1',
        feedback: 'Hard water stains detected. Recommend using vinegar solution.',
        confidence: 0.85,
        suggestions: ['Use white vinegar and water solution', 'Apply with microfiber cloth', 'Let sit for 10 minutes before rinsing'],
        isResolved: false,
        createdAt: '2024-01-15T10:35:00Z'
      }
    ]
  },
  {
    id: '3',
    title: 'Living Room Refresh',
    description: 'General cleaning and dusting of living room area',
    property: '789 Pine St, House 12',
    address: '789 Pine St, House 12, Queens, NY 11375',
    status: 'completed',
    estimatedTime: '1 hour',
    priority: 'low',
    createdAt: '2024-01-14T14:00:00Z',
    updatedAt: '2024-01-14T15:00:00Z',
    instructions: 'Dust all surfaces, vacuum carpets, clean windows.',
    scheduledTime: '2024-01-14T16:00:00Z',
    photos: [
      {
        id: 'photo3',
        taskId: '3',
        url: 'https://example.com/living-room-before.jpg',
        type: 'before',
        uploadedAt: '2024-01-14T14:00:00Z',
        isUploaded: true,
        tags: ['living-room', 'before'],
        notes: 'Living room before cleaning'
      },
      {
        id: 'photo4',
        taskId: '3',
        url: 'https://example.com/living-room-after.jpg',
        type: 'after',
        uploadedAt: '2024-01-14T15:00:00Z',
        isUploaded: true,
        tags: ['living-room', 'after'],
        notes: 'Living room after cleaning'
      }
    ],
    issues: [],
    aiFeedback: []
  },
  {
    id: '4',
    title: 'Bedroom Organization',
    description: 'Cleaning and organizing bedroom spaces',
    property: '321 Elm Rd, Apt 2A',
    address: '321 Elm Rd, Apt 2A, Bronx, NY 10451',
    status: 'needs_followup',
    estimatedTime: '1.5 hours',
    priority: 'medium',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    instructions: 'Organize closet, dust furniture, change bed linens.',
    scheduledTime: '2024-01-16T09:00:00Z',
    photos: [],
    issues: [
      {
        id: 'issue2',
        taskId: '4',
        type: 'damage',
        description: 'Crack in bedroom window',
        severity: 'high',
        location: 'Bedroom window',
        notes: 'Window needs repair before cleaning',
        createdAt: '2024-01-15T11:00:00Z',
        isResolved: false
      }
    ],
    aiFeedback: []
  },
  {
    id: '5',
    title: 'Office Space Clean',
    description: 'Professional office cleaning service',
    property: '555 Business Blvd, Suite 100',
    address: '555 Business Blvd, Suite 100, Manhattan, NY 10005',
    status: 'pending',
    estimatedTime: '3 hours',
    priority: 'high',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    instructions: 'Clean all workstations, sanitize common areas, empty trash bins.',
    scheduledTime: '2024-01-17T18:00:00Z',
    photos: [],
    issues: [],
    aiFeedback: []
  },
];

export const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Main Street Apartment',
    address: '123 Main St, Apt 4B, New York, NY 10001',
    type: 'apartment',
    rooms: 2,
    bathrooms: 1,
    instructions: 'Use eco-friendly cleaning products. No pets in unit.',
    specialRequirements: ['Eco-friendly products', 'No pets']
  },
  {
    id: '2',
    name: 'Oak Avenue Unit',
    address: '456 Oak Ave, Unit 7, Brooklyn, NY 11201',
    type: 'apartment',
    rooms: 1,
    bathrooms: 1,
    instructions: 'Tenant has allergies. Use hypoallergenic products.',
    specialRequirements: ['Hypoallergenic products', 'No strong fragrances']
  },
  {
    id: '3',
    name: 'Pine Street House',
    address: '789 Pine St, House 12, Queens, NY 11375',
    type: 'house',
    rooms: 4,
    bathrooms: 2,
    instructions: 'Large family home. Focus on common areas.',
    specialRequirements: ['Family-friendly', 'Pet-friendly']
  },
  {
    id: '4',
    name: 'Elm Road Apartment',
    address: '321 Elm Rd, Apt 2A, Bronx, NY 10451',
    type: 'apartment',
    rooms: 3,
    bathrooms: 1,
    instructions: 'Elderly tenant. Be extra careful with fragile items.',
    specialRequirements: ['Elderly care', 'Fragile items']
  },
  {
    id: '5',
    name: 'Business Boulevard Office',
    address: '555 Business Blvd, Suite 100, Manhattan, NY 10005',
    type: 'office',
    rooms: 8,
    bathrooms: 2,
    instructions: 'Professional office space. Maintain confidentiality.',
    specialRequirements: ['Professional service', 'Confidentiality']
  },
];

export const mockUser: User = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@propertysanta.com',
  role: 'cleaner',
  avatar: 'https://example.com/avatar.jpg',
  phone: '+1 (555) 123-4567',
};

export const mockCleaner: Cleaner = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@propertysanta.com',
  phone: '+1 (555) 123-4567',
  rating: 4.8,
  specialties: ['Deep Cleaning', 'Kitchen Sanitization', 'Bathroom Cleaning', 'Office Cleaning'],
  availability: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  },
};

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Task Assigned',
    message: 'You have been assigned a new kitchen cleaning task at 123 Main St',
    type: 'info',
    read: false,
    createdAt: '2024-01-15T09:00:00Z',
  },
  {
    id: '2',
    title: 'Task Completed',
    message: 'Great job! Your bathroom cleaning task has been marked as completed',
    type: 'success',
    read: true,
    createdAt: '2024-01-15T11:30:00Z',
  },
  {
    id: '3',
    title: 'Photo Upload Required',
    message: 'Please upload before/after photos for your completed task',
    type: 'warning',
    read: false,
    createdAt: '2024-01-15T12:00:00Z',
  },
  {
    id: '4',
    title: 'AI Feedback Available',
    message: 'AI has reviewed your photos and provided feedback on issue resolution',
    type: 'info',
    read: false,
    createdAt: '2024-01-15T12:30:00Z',
  },
];

export const mockIssues: Issue[] = [
  {
    id: 'issue1',
    taskId: '2',
    type: 'stain',
    description: 'Hard water stains on shower door',
    photoId: 'photo2',
    severity: 'medium',
    location: 'Shower door',
    notes: 'Will need special cleaner for hard water stains',
    createdAt: '2024-01-15T10:30:00Z',
    isResolved: false
  },
  {
    id: 'issue2',
    taskId: '4',
    type: 'damage',
    description: 'Crack in bedroom window',
    severity: 'high',
    location: 'Bedroom window',
    notes: 'Window needs repair before cleaning',
    createdAt: '2024-01-15T11:00:00Z',
    isResolved: false
  },
  {
    id: 'issue3',
    taskId: '1',
    type: 'weed',
    description: 'Weeds growing in kitchen window sill',
    severity: 'low',
    location: 'Kitchen window',
    notes: 'Small weeds, easy to remove',
    createdAt: '2024-01-15T09:00:00Z',
    isResolved: true,
    resolvedAt: '2024-01-15T09:30:00Z'
  }
];

export const mockAIFeedback: AIFeedback[] = [
  {
    id: 'ai1',
    taskId: '2',
    issueId: 'issue1',
    feedback: 'Hard water stains detected. Recommend using vinegar solution.',
    confidence: 0.85,
    suggestions: ['Use white vinegar and water solution', 'Apply with microfiber cloth', 'Let sit for 10 minutes before rinsing'],
    isResolved: false,
    createdAt: '2024-01-15T10:35:00Z'
  },
  {
    id: 'ai2',
    taskId: '4',
    issueId: 'issue2',
    feedback: 'Window damage detected. Safety concern - recommend professional repair.',
    confidence: 0.92,
    suggestions: ['Contact property manager immediately', 'Do not attempt to clean around crack', 'Document damage with photos'],
    isResolved: false,
    createdAt: '2024-01-15T11:05:00Z'
  }
]; 