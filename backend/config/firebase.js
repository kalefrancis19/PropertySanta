const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
let app;
let db;

try {
  // Check if app is already initialized to avoid 'app already exists' error
  app = admin.app();
  db = admin.firestore();
  console.log('Firebase Admin SDK already initialized');
} catch (e) {
  try {
    // Initialize the app if it doesn't exist
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    // Initialize Firestore with settings
    db = admin.firestore();
    
    // Enable offline support
    db.settings({ ignoreUndefinedProperties: true });
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    process.exit(1);
  }
}

// Enable Firestore emulator in development if specified
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log('Using Firestore emulator at', process.env.FIRESTORE_EMULATOR_HOST);
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST;
}
if (process.env.NODE_ENV === 'development' && process.env.USE_FIREBASE_EMULATOR === 'true') {
  console.log('🔌 Using Firebase Emulator');
  db.settings({
    host: 'localhost:8080',
    ssl: false
  });
} else {
  console.log('🌐 Using Production Firestore');
}

// Test the connection
const testConnection = async () => {
  try {
    await db.collection('test').doc('connection').get();
    console.log('✅ Successfully connected to Firestore');
  } catch (error) {
    console.error('❌ Firestore connection test failed:', error.message);
    if (error.details) {
      console.error('Error details:', error.details);
    }
    throw error;
  }
};

module.exports = { 
  db, 
  admin,
  testConnection
};
