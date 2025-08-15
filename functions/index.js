const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Initialize Express app for HTTP functions
const app = express();

// Configure CORS
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import middleware
const { verifyToken, isAdmin } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');
const propertyRoutes = require('./routes/properties');
const cleaningReportRoutes = require('./routes/cleaningReports');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', verifyToken, taskRoutes);
app.use('/api/ai', verifyToken, aiRoutes);
app.use('/api/properties', verifyToken, propertyRoutes);
app.use('/api/reports', verifyToken, cleaningReportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Cleaner SMS API is running on Firebase Functions',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint to list all properties (temporary)
app.get('/api/debug/properties', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('properties').get();
    const properties = [];
    snapshot.forEach(doc => {
      properties.push({ id: doc.id, ...doc.data() });
    });
    res.json({ success: true, count: properties.length, properties });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  
  // Handle JWT errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: 'UNAUTHORIZED'
    });
  }
  
  // Handle other errors
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);

// Example of a direct callable function
exports.getUserProfile = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  try {
    const userRef = db.collection('users').doc(context.auth.uid);
    const doc = await userRef.get();
    
    if (!doc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User not found'
      );
    }
    
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error fetching user profile',
      error.message
    );
  }
});

// Scheduled function example (runs every day at midnight)
exports.dailyCleanup = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      // Perform daily cleanup tasks here
      console.log('Running daily cleanup...');
      
      // Example: Archive old completed tasks
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const snapshot = await db.collection('tasks')
        .where('status', '==', 'completed')
        .where('completedAt', '<', weekAgo)
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { archived: true });
      });
      
      await batch.commit();
      console.log(`Archived ${snapshot.size} old tasks`);
      
      return null;
    } catch (error) {
      console.error('Error in daily cleanup:', error);
      return null;
    }
  });
