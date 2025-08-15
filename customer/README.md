# PropertySanta AdminWeb

A modern web interface for managing properties and cleaning tasks, integrated with the PropertySanta backend.

## Features

### Property Management
- **CRUD Operations**: Create, read, update, and delete properties
- **Manual Management**: Edit cleaning and maintenance manuals for each property
- **Status Toggle**: Activate/deactivate properties
- **Real-time Data**: Connected to MongoDB through the backend API

### Dashboard
- **Statistics Overview**: View total properties, tasks, and their status
- **Quick Actions**: Navigate to property management and task monitoring
- **Recent Items**: See latest properties and tasks

### Task Monitoring
- **Task Overview**: View all cleaning tasks with their status
- **Status Tracking**: Monitor pending, in-progress, and completed tasks
- **Task Details**: See task descriptions, addresses, and instructions

## Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: React hooks with useState and useEffect
- **API Integration**: Axios for HTTP requests
- **Notifications**: React Hot Toast for user feedback
- **Icons**: Lucide React for consistent iconography

## Backend Integration

The AdminWeb connects to the PropertySanta backend API:

- **Base URL**: `http://localhost:5000/api`
- **Properties API**: `/api/properties`
- **Tasks API**: `/api/tasks`
- **Manual Management**: `/api/properties/:id/manual`

## Database Schema

The AdminWeb works with the MongoDB schema from the backend:

### Property Schema
```javascript
{
  propertyId: String,
  name: String,
  address: String,
  type: 'apartment' | 'house' | 'office',
  rooms: Number,
  bathrooms: Number,
  squareFootage: Number,
  estimatedTime: String,
  manual: {
    title: String,
    content: String,
    lastUpdated: Date
  },
  roomTasks: Array,
  instructions: String,
  specialRequirements: Array,
  owner: Object,
  isActive: Boolean,
  coordinates: Object
}
```

### Task Schema
```javascript
{
  title: String,
  description: String,
  property: ObjectId,
  address: String,
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled',
  estimatedTime: String,
  priority: 'low' | 'medium' | 'high',
  assignedTo: ObjectId,
  instructions: String
}
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB running (configured in backend)
- Backend server running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Configuration

Create a `.env.local` file in the AdminWeb directory:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## API Endpoints

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `GET /api/properties/:id/manual` - Get property manual
- `PATCH /api/properties/:id/manual` - Update property manual

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/property/:propertyId` - Get tasks by property

## Manual Management

The AdminWeb provides a dedicated interface for managing property manuals:

1. **Access**: Click the "Manual" button on any property card
2. **Edit**: Update the manual title and content
3. **Save**: Changes are immediately saved to the database
4. **View**: Manuals are displayed in the property details

This feature allows property owners to:
- Create detailed cleaning instructions
- Specify maintenance requirements
- Document special handling procedures
- Update instructions in real-time

## Development

### Project Structure
```
AdminWeb/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── dashboard/       # Dashboard page
│   │   ├── properties/      # Property management
│   │   └── tasks/          # Task monitoring
│   ├── components/          # Reusable components
│   ├── services/           # API integration
│   └── types/              # TypeScript definitions
├── public/                 # Static assets
└── package.json           # Dependencies and scripts
```

### Key Components

- **ThemeProvider**: Dark/light mode toggle
- **API Service**: Centralized API communication
- **Property Cards**: Display property information
- **Manual Modal**: Rich text editor for manuals
- **Task List**: Status-based task display

## Integration with Cleaner App

The AdminWeb is designed to work alongside the PropertySanta cleaner app:

- **Shared Database**: Both apps use the same MongoDB instance
- **Consistent Schema**: Property and task data is synchronized
- **Manual Updates**: Changes made in AdminWeb are reflected in the cleaner app
- **Real-time Status**: Task status updates are visible in both interfaces

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live status updates
- **Advanced Filtering**: Search and filter properties and tasks
- **Bulk Operations**: Multi-select for batch updates
- **Export Features**: Generate reports and export data
- **User Management**: Role-based access control
- **Analytics Dashboard**: Performance metrics and insights 