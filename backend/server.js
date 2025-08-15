const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const net = require('net');
require('dotenv').config({ path: './config.env' });

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');
const propertyRoutes = require('./routes/properties');
const userRoutes = require('./routes/userRoutes');

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PropertySanta Cleaner API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint to check properties
app.get('/debug/properties', async (req, res) => {
  try {
    const Property = require('./models/Property');
    const properties = await Property.find({});
    res.json({
      success: true,
      count: properties.length,
      properties: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);

// Function to find available port
const findAvailablePort = async (startPort) => {
  const port = parseInt(startPort);
  if (isNaN(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid port number: ${startPort}`);
  }
  
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.listen(port, () => {
      const { port: actualPort } = server.address();
      server.close(() => resolve(actualPort));
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        server.close();
        findAvailablePort(port + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
};

// Function to update frontend environment files
const updateFrontendEnv = (port) => {
  const apiUrl = `http://localhost:${port}/api`;
  
  // Update both frontend environment files
  const frontendPaths = [
    path.join(__dirname, '..', 'cleaner', '.env.local'), // Cleaner App
    path.join(__dirname, '..', 'admin', '.env.local')   // Admin App
  ];

  frontendPaths.forEach((envPath) => {
    try {
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }

      const apiUrlLine = `NEXT_PUBLIC_API_URL=${apiUrl}`;

      if (envContent.includes('NEXT_PUBLIC_API_URL=')) {
        envContent = envContent.replace(
          /NEXT_PUBLIC_API_URL=.*/g,
          apiUrlLine
        );
      } else {
        envContent += `\n${apiUrlLine}`;
      }

      fs.writeFileSync(envPath, envContent);
      console.log(`✅ Updated ${path.basename(path.dirname(envPath))} .env.local with API URL: ${apiUrl}`);
    } catch (error) {
      console.error(`❌ Failed to update ${path.basename(path.dirname(envPath))} environment:`, error);
    }
  });
};

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize database with sample data
const initializeDatabase = async () => {
  try {
    console.log('🔄 Starting database initialization...');
    const User = require('./models/User');
    const Property = require('./models/Property');
    const Task = require('./models/Task'); // <-- Add Task model

    // --- Existing user creation code (cleaner, customer, admin) ---
    const existingCleaner = await User.findOne({ email: 'elite@gmail.com' });
    const existingCustomer = await User.findOne({ email: 'john.smith@email.com' });
    const existingAdmin = await User.findOne({ email: 'admin@propertysanta.com' });
    
    let cleaner, customer, admin;

    if (!existingCleaner) {
      cleaner = new User({
        name: 'elite cleaner',
        email: 'elite@gmail.com',
        password: 'password',
        phone: '+1 (555) 123-4567',
        role: 'cleaner',
        rating: 4.8,
        specialties: ['Deep Cleaning', 'Kitchen Sanitization'],
        availability: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
      });
      await cleaner.save();
      console.log('✅ Sample cleaner created');
    } else cleaner = existingCleaner;

    if (!existingCustomer) {
      customer = new User({
        name: 'John Smith',
        email: 'john.smith@email.com',
        password: 'password',
        phone: '+1 (555) 987-6543',
        role: 'customer'
      });
      await customer.save();
      console.log('✅ Sample customer created');
    } else customer = existingCustomer;

    if (!existingAdmin) {
      admin = new User({
        name: 'PropertySanta Admin',
        email: 'admin@propertysanta.com',
        password: 'admin123',
        phone: '+1 (555) 000-0000',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Sample admin created');
    } else admin = existingAdmin;

    // --- Existing property creation code ---
    const existingProperties = await Property.countDocuments();
    if (existingProperties === 0) {
      const sampleProperty = new Property({
        propertyId: 'EO-1208-RDU',
        name: 'Enchanted Oaks House',
        address: '1208 Enchanted Oaks Drive, Raleigh, NC 27606',
        type: 'house',
        squareFootage: 1945,
        manual: {
          title: 'Live Cleaning & Maintenance Manual',
          content: 'Detailed manual content goes here. Focus on kitchen and bathrooms. Use special cleaner for granite countertops.',
        },
        roomTasks: [
          {
            roomType: 'bedroom',
            tasks: [
              { description: 'make the bed', Regular: 'week' },
              { description: 'Clean floor', Regular: 'week' }
            ],
          },
          {
            roomType: 'bathroom',
            tasks: [
              { description: 'clean the floor', Regular: '2week' },
            ],
          },
        ],
        customer: customer._id, // assign actual customer ID
        cycle: 'weekly',
        isActive: true,
      });
      await sampleProperty.save();
      console.log('✅ Sample property created successfully.');
    }

    // --- Add sample Task data ---
    const existingTasks = await Task.countDocuments();
    if (existingTasks === 0) {
      const sampleTask = new Task({
        propertyId: 'EO-1208-RDU',
        requirements: [
          {
            roomType: 'kitchen',
            tasks: [
              { description: 'Clean countertops' },
              { description: 'Mop floor' }
            ]
          },
          {
            roomType: 'living room',
            tasks: [
              { description: 'Vacuum carpet' },
              { description: 'Dust shelves' }
            ]
          }
        ],
        specialRequirement: 'Use eco-friendly cleaning products',
        scheduledTime: new Date('2025-09-17T10:00:00Z'),
        assignedTo: "64b5f1f0e3a3c2a1b0c4d5e6", 
        photos: [
          {
            url: 'https://example.com/photos/kitchen_before.jpg',
            type: 'before',
            localPath: '/uploads/kitchen_before.jpg',
            tags: ['kitchen', 'countertop'],
            notes: 'Initial condition of the kitchen'
          }
        ],
        issues: [
          {
            type: 'Damage',
            description: 'Scratch on the kitchen countertop',
            location: 'kitchen',
            notes: 'Reported by cleaning staff',
            isResolved: false
          }
        ],
        aiFeedback: [
          {
            feedback: 'Countertop needs deep cleaning',
            improvements: ['Use stronger cleaner', 'Wipe edges carefully'],
            confidence: 0.85,
            suggestions: ['Schedule follow-up cleaning']
          }
        ],
        chatHistory: '2025-08-16: Task assigned to elite cleaner.',
        isActive: true
      });
      await sampleTask.save();
      console.log('✅ Sample task created successfully.');
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

      if (availablePort !== PORT) {
        console.log(`⚠️  Port ${PORT} was in use, using port ${availablePort} instead`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 