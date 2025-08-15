# Cleaner SMS - Firebase Functions

This directory contains the Firebase Cloud Functions for the Cleaner SMS application. These functions provide the backend API for the application, handling authentication, task management, property management, and AI-powered features.

## Project Structure

```
functions/
├── controllers/           # Request handlers for different resources
│   ├── aiController.js    # AI-related functionality
│   ├── authController.js  # Authentication and user management
│   ├── propertyController.js # Property management
│   ├── taskController.js  # Task management
│   └── cleaningReportController.js # Cleaning reports and analytics
├── middleware/            # Express middleware
│   └── auth.js            # Authentication middleware
├── routes/                # Route definitions
│   ├── ai.js              # AI feature routes
│   ├── auth.js            # Authentication routes
│   ├── properties.js      # Property management routes
│   ├── tasks.js           # Task management routes
│   └── cleaningReports.js # Reporting routes
├── index.js               # Main entry point for Firebase Functions
└── package.json           # Dependencies and scripts
```

## Available Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Log in with email/password
- `POST /api/auth/request-otp` - Request OTP for phone login
- `POST /api/auth/verify-otp` - Verify OTP and log in
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Log out current user
- `POST /api/auth/refresh-token` - Refresh authentication token

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `PATCH /api/properties/:id/status` - Toggle property status
- `POST /api/properties/:id/photos` - Add photo to property
- `POST /api/properties/:id/issues` - Report issue with property

### Tasks
- `GET /api/tasks` - Get all tasks for current user
- `GET /api/tasks/:propertyId/task/:taskId` - Get task by ID
- `PATCH /api/tasks/:propertyId/task/:taskId/status` - Update task status
- `POST /api/tasks/:propertyId/task/:taskId/photos` - Add photo to task
- `POST /api/tasks/:propertyId/task/:taskId/issues` - Report issue with task
- `PATCH /api/tasks/:propertyId/task/:taskId/notes` - Update task notes

### AI Features
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/photos/upload` - Upload and analyze photo
- `POST /api/ai/photos/compare` - Compare before/after photos
- `POST /api/ai/workflow/guidance` - Get workflow recommendations
- `GET /api/ai/workflow/state` - Get current workflow state
- `POST /api/ai/context/update` - Update AI context

### Reports
- `GET /api/reports` - Get all cleaning reports (admin only)
- `GET /api/reports/property/:propertyId` - Get detailed report for a property

## Setup and Deployment

### Prerequisites
- Node.js 16 or later
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project with Firestore and Authentication enabled

### Local Development

1. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

2. Set up Firebase configuration:
   ```bash
   firebase login
   firebase use --add
   ```

3. Start the emulator suite:
   ```bash
   firebase emulators:start
   ```

4. The API will be available at `http://localhost:5001/YOUR-PROJECT-ID/us-central1/api`

### Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy --only functions
   ```

3. The API will be available at `https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/api`

## Environment Variables

Create a `.env` file in the `functions` directory with the following variables:

```
NODE_ENV=development
FIREBASE_CONFIG={"projectId":"your-project-id",...}
```

## Authentication

All protected routes require a valid Firebase ID token in the `Authorization` header:

```
Authorization: Bearer <firebase_id_token>
```

## Error Handling

All errors are returned in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details"
}
```

## Testing

Run tests with:

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
