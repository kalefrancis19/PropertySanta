# PropertySanta Cleaner App

A comprehensive cleaning management application with AI-powered assistance, designed for professional cleaners and property managers.

## 🚀 Features

### Core Functionality
- **Property-Centric Workflow**: Manage cleaning tasks at the property level with detailed room-specific instructions
- **AI-Powered Chat Assistant**: Contextual guidance for cleaning tasks with photo analysis capabilities
- **Real-time Task Management**: Track progress, mark tasks as completed, and manage cleaning schedules
- **Photo Documentation**: Upload before/after photos with AI analysis for quality assurance
- **Professional UI/UX**: Mobile-first design with dark mode support

### AI Integration
- **Contextual Assistance**: AI understands property details, room tasks, and cleaning manuals
- **Photo Analysis**: Upload photos for cleanliness assessment and recommendations
- **Step-by-step Guidance**: Get detailed instructions for specific rooms and tasks
- **Quality Control**: AI analyzes photos to ensure cleaning standards are met

### Authentication & Security
- **Dual Login Methods**: Password-based and OTP authentication
- **JWT Token Management**: Secure session handling
- **Protected Routes**: Role-based access control
- **Backend AI Processing**: All AI communication handled securely on the server

## 🛠 Tech Stack

### Frontend
- **Next.js 15.4.5** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hooks** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Google Gemini AI** - AI integration (backend-only)

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Concurrently** - Run multiple commands

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #8B5CF6)
- **Secondary**: Gray scale (#F9FAFB to #111827)
- **Accent**: Green (#10B981), Red (#EF4444), Yellow (#F59E0B)

### Typography
- **Headings**: Inter font family
- **Body**: System font stack
- **Mobile-first**: Responsive design patterns

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Gradient backgrounds, hover effects
- **Inputs**: Clean borders, focus states
- **Navigation**: Bottom navigation for mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Cleaner_SMS
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Environment Setup**
   
   Create `.env.local` in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
   
   Create `backend/config.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/propertysanta
   JWT_SECRET=your_jwt_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   GEMINI_API_KEY=your_gemini_api_key_here
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both frontend (port 3000) and backend (port 5000) servers.

### Database Setup
The application automatically creates sample data on first run:
- Sample user: `elite@gmail.com` / `password`
- Sample properties with detailed cleaning manuals
- Room-specific tasks and instructions

## 📱 Mobile Experience

### Responsive Design
- **Mobile-first approach**: Optimized for mobile devices
- **Touch-friendly**: Large buttons and intuitive gestures
- **Bottom navigation**: Easy thumb access
- **Sticky elements**: Headers and input areas stay visible

### Key Mobile Features
- **Swipe gestures**: Navigate between screens
- **Photo upload**: Camera integration for documentation
- **Voice input**: Speech-to-text capabilities
- **Offline support**: Basic functionality without internet

## 🔄 User Flow

### 1. Authentication
- Login with email/password or OTP
- JWT token management
- Protected route access

### 2. Dashboard
- View properties and tasks
- Property-level task management
- Quick access to AI chat

### 3. AI Chat
- Contextual property information
- Photo analysis and documentation
- Step-by-step cleaning guidance
- Quality control feedback

### 4. Task Management
- Mark tasks as completed
- Update room task status
- Track progress across properties

## 🏗 Architecture

### Frontend Structure
```
src/
├── app/                 # Next.js App Router
│   ├── chat/           # AI Chat interface
│   ├── dashboard/      # Main dashboard
│   ├── profile/        # User profile
│   └── signup/         # Authentication
├── components/          # Reusable components
├── services/           # API services
└── types/              # TypeScript definitions
```

### Backend Structure
```
backend/
├── controllers/         # Request handlers
├── middleware/          # Authentication & validation
├── models/             # MongoDB schemas
├── routes/             # API endpoints
├── services/           # Business logic (AI service)
└── uploads/            # File storage
```

### Key Components

#### Frontend
- **AuthProvider**: Global authentication state
- **ProtectedRoute**: Route protection
- **ThemeProvider**: Dark/light mode
- **apiService**: Centralized API calls
- **Chat Interface**: AI communication

#### Backend
- **Authentication**: JWT-based auth system
- **Property Management**: CRUD operations
- **Task Tracking**: Status updates
- **AI Service**: Gemini integration
- **Photo Analysis**: Image processing

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/request-otp` - OTP request

### Properties & Tasks
- `GET /api/tasks/properties` - List all properties
- `GET /api/tasks/property/:id` - Get property details
- `PATCH /api/tasks/property/:id/room-task` - Update room task status

### AI Services
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/analyze-photo` - Analyze uploaded photos
- `POST /api/ai/update-context` - Update AI context

## 🎯 Key Features

### Property-Centric Design
- **Property as Primary Unit**: All tasks organized by property
- **Room-Level Details**: Detailed tasks within each room
- **Comprehensive Manuals**: Property-specific cleaning instructions
- **Progress Tracking**: Property-level completion status

### AI Integration
- **Contextual Understanding**: AI knows property details and tasks
- **Photo Analysis**: Upload photos for quality assessment
- **Professional Guidance**: Step-by-step cleaning instructions
- **Quality Control**: AI feedback on cleaning standards

### Security & Performance
- **Backend AI Processing**: All AI communication on server
- **JWT Authentication**: Secure session management
- **Protected Routes**: Role-based access control
- **Mobile Optimization**: Fast, responsive interface

## 🚀 Deployment

### Environment Variables
- **Frontend**: `NEXT_PUBLIC_API_URL`
- **Backend**: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`

### Production Considerations
- **MongoDB Atlas**: Cloud database
- **Vercel/Netlify**: Frontend deployment
- **Railway/Render**: Backend deployment
- **Environment Variables**: Secure configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details. 