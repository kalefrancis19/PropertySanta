// functions/controllers/authController.js
const admin = require('firebase-admin');
const { db } = require('firebase-admin/firestore');

// Sign up new user
exports.signUp = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const userRef = db.collection('users').where('email', '==', email);
    const snapshot = await userRef.get();
    
    if (!snapshot.empty) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone
    });

    // Create user in Firestore
    const newUser = {
      uid: userRecord.uid,
      name,
      email,
      phone,
      role: 'cleaner',
      isActive: true,
      availability: {
        friday: true,
        saturday: false,
        sunday: false
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(userRecord.uid).set(newUser);

    // Generate custom token
    const token = await admin.auth().createCustomToken(userRecord.uid);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: { uid: userRecord.uid, ...newUser },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Login with email/password
exports.loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // This is a simplified version - in production, use Firebase Client SDK for login
    const userRecord = await admin.auth().getUserByEmail(email);
    const token = await admin.auth().createCustomToken(userRecord.uid);
    
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: { uid: userRecord.uid, ...userDoc.data() },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      error: error.message
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: { uid: userId, ...userDoc.data() }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    // In a real app, you'd revoke the user's refresh tokens
    // This is handled client-side with Firebase Auth
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message
    });
  }
};

// Middleware to verify token
exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Stub for OTP verification (to be implemented)
exports.requestOTP = async (req, res) => {
  res.status(501).json({ 
    success: false, 
    message: 'OTP functionality not implemented yet' 
  });
};

// Stub for OTP login (to be implemented)
exports.loginWithOTP = async (req, res) => {
  res.status(501).json({ 
    success: false, 
    message: 'OTP login not implemented yet' 
  });
};

// Stub for token refresh (to be implemented)
exports.refreshToken = async (req, res) => {
  res.status(501).json({ 
    success: false, 
    message: 'Token refresh not implemented yet' 
  });
};