const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const net = require('net');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });
const { db } = require('./config/firebase');

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');
const propertyRoutes = require('./routes/properties');

const app = express();
const PORT = parseInt(process.env.PORT) || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PropertySanta Cleaner API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint
app.get('/debug/properties', async (req, res) => {
  try {
    const snapshot = await db.collection('properties').get();
    const properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: properties.length, properties });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/properties', propertyRoutes);

// Find available port
const findAvailablePort = async (startPort) => {
  const port = parseInt(startPort);
  if (isNaN(port) || port < 0 || port > 65535) throw new Error(`Invalid port number: ${startPort}`);

  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(port, () => {
      const { port: actualPort } = server.address();
      server.close(() => resolve(actualPort));
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') findAvailablePort(port + 1).then(resolve).catch(reject);
      else reject(err);
    });
  });
};

// Update frontend .env
const updateFrontendEnv = (port) => {
  const apiUrl = `http://localhost:${port}/api`;
  const frontendPaths = [
    path.join(__dirname, '..', 'cleaner', '.env.local'),
    path.join(__dirname, '..', 'admin', '.env.local')
  ];

  frontendPaths.forEach((envPath) => {
    try {
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
      const apiUrlLine = `NEXT_PUBLIC_API_URL=${apiUrl}`;
      envContent = envContent.includes('NEXT_PUBLIC_API_URL=') 
        ? envContent.replace(/NEXT_PUBLIC_API_URL=.*/g, apiUrlLine)
        : envContent + `\n${apiUrlLine}`;
      fs.writeFileSync(envPath, envContent);
      console.log(`✅ Updated ${path.basename(path.dirname(envPath))} .env.local with API URL: ${apiUrl}`);
    } catch (error) {
      console.error(`❌ Failed to update ${path.basename(path.dirname(envPath))} environment:`, error);
    }
  });
};

// Connect Firestore
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to Firestore...');
    await db.collection('connection_test').limit(1).get();
    console.log('✅ Firestore connected successfully');
  } catch (error) {
    console.error('❌ Firestore connection error:', error);
    process.exit(1);
  }
};

// Initialize sample data
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing Firestore sample data...');

    // ---- USERS ----
    const usersRef = db.collection('users');

    const createUserIfNotExists = async (email, userData) => {
      const snapshot = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();
      if (snapshot.empty) {
        if (userData.password) {
          const salt = await bcrypt.genSalt(10);
          userData.password = await bcrypt.hash(userData.password, salt);
        }
        userData.createdAt = new Date();
        userData.updatedAt = new Date();
        const docRef = await usersRef.add(userData);
        console.log(`✅ Created user: ${email}`);
        return { id: docRef.id, ...userData };
      } else {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      }
    };

    const adminUser = await createUserIfNotExists('admin@propertysanta.com', {
      name: 'Admin User',
      email: 'admin@propertysanta.com',
      password: 'admin123',
      phone: '+1 (555) 555-5555',
      role: 'admin'
    });

    const cleanerUser = await createUserIfNotExists('elite@gmail.com', {
      name: 'Elite Cleaner',
      email: 'elite@gmail.com',
      password: 'password',
      phone: '+1 (555) 123-4567',
      role: 'cleaner',
      rating: 4.8,
      specialties: ['Deep Cleaning', 'Kitchen Sanitization'],
      availability: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false }
    });

    const customerUser = await createUserIfNotExists('john.smith@email.com', {
      name: 'John Smith',
      email: 'john.smith@email.com',
      password: 'password',
      phone: '+1 (555) 987-6543',
      role: 'customer'
    });

    // ---- PROPERTIES ----
    const propertiesRef = db.collection('properties');
    const propSnapshot = await propertiesRef.where('propertyId', '==', 'EO-1208-RDU').limit(1).get();

    if (propSnapshot.empty) {
      const sampleProperty = {
        propertyId: 'EO-1208-RDU',
        name: 'Enchanted Oaks House',
        address: '1208 Enchanted Oaks Drive, Raleigh, NC 27606',
        type: 'house',
        squareFootage: 1945,
        manual: {
          title: 'Live Cleaning & Maintenance Manual',
          content: 'Detailed manual content goes here. Focus on kitchen and bathrooms. Use special cleaner for granite countertops.'
        },
        roomTasks: [
          { roomType: 'bedroom', tasks: [{ description: 'make the bed' }, { description: 'Clean floor' }], estimatedTime: '45 minutes', specialInstructions: ['Use granite-safe cleaner only.'], isCompleted: false },
          { roomType: 'bathroom', tasks: [{ description: 'clean the floor' }], estimatedTime: '30 minutes', specialInstructions: ['Grout needs extra attention this week.'], isCompleted: false }
        ],
        scheduledTime: new Date(new Date().setDate(new Date().getDate() + 2)),
        customer: customerUser.id,
        assignedTo: cleanerUser.id,
        photos: [],
        issues: [],
        aiFeedback: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await propertiesRef.add(sampleProperty);
      console.log('✅ Sample property created');
    } else {
      console.log('✅ Sample property already exists');
    }

  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  await initializeDatabase();

  try {
    const availablePort = await findAvailablePort(PORT);

    app.listen(availablePort, () => {
      console.log(`🚀 Server running on port ${availablePort}`);
      console.log(`📱 API available at http://localhost:${availablePort}`);
      console.log(`🔗 Health check: http://localhost:${availablePort}/health`);
      updateFrontendEnv(availablePort);
      if (availablePort !== PORT) console.log(`⚠️  Port ${PORT} was in use, using port ${availablePort} instead`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
