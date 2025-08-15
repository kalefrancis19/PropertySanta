// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase'); // Firestore instance
const { validationResult } = require('express-validator');

// Generate JWT token
const generateToken = (userId, expiresIn = process.env.JWT_EXPIRES_IN) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
};

// -------------------- User Helpers -------------------- //
const getUserByEmail = async (email) => {
  const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
  return snapshot.empty ? null : { 
    ...snapshot.docs[0].data(),
    id: snapshot.docs[0].id,
    _id: snapshot.docs[0].id // Add _id for backward compatibility
  };
};

const getUserById = async (id) => {
  const doc = await db.collection('users').doc(id).get();
  return doc.exists ? { 
    ...doc.data(),
    id: doc.id,
    _id: doc.id // Add _id for backward compatibility
  } : null;
};

const getUserByPhoneAndOTP = async (phone, otp) => {
  const snapshot = await db.collection('users')
    .where('phone', '==', phone)
    .where('otp', '==', otp)
    .limit(1)
    .get();
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

const createUser = async (data) => {
  const docRef = await db.collection('users').add({
    ...data,
    _id: db.collection('users').doc().id // Add _id for backward compatibility
  });
  const doc = await docRef.get();
  return { 
    ...doc.data(),
    id: doc.id,
    _id: doc.id
  };
};

const updateUser = async (id, data) => {
  // Ensure _id is not overwritten
  const { _id, ...dataWithoutId } = data;
  await db.collection('users').doc(id).update(dataWithoutId);
};

// -------------------- Controllers -------------------- //

// Sign up new user
const signUp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const { name, email, password, phone } = req.body;

    const existingUser = await getUserByEmail(email);
    if (existingUser) return res.status(409).json({ success: false, message: 'User with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'cleaner',
      isActive: true,
      availability: { friday: true, saturday: false, sunday: false },
      createdAt: new Date().toISOString(),
      refreshToken: null
    };

    const user = await createUser(newUser);

    const token = generateToken(user.id);
    const refreshToken = generateToken(user.id, '30d');

    await updateUser(user.id, { refreshToken });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user, token, refreshToken }
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Login with password
const loginWithPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const { email, password } = req.body;

    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    // if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });

    const token = generateToken(user.id);
    const refreshToken = generateToken(user.id, '30d');

    await updateUser(user.id, { refreshToken });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, token, refreshToken, loginMethod: 'password' }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Request OTP
const requestOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const { phone } = req.body;
    const snapshot = await db.collection('users').where('phone', '==', phone).limit(1).get();
    if (snapshot.empty) return res.status(404).json({ success: false, message: 'User not found' });

    const user = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    if (!user.isActive) return res.status(404).json({ success: false, message: 'User not found or inactive' });

    const otp = '123456'; // mock OTP
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await updateUser(user.id, { otp, otpExpiresAt });

    res.json({ success: true, message: 'OTP sent successfully', data: { otp } }); // remove OTP in production
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Login with OTP
const loginWithOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const user = await getUserByPhoneAndOTP(phone, otp);
    if (!user || new Date(user.otpExpiresAt) < new Date()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }

    await updateUser(user.id, { otp: null, otpExpiresAt: null, lastLogin: new Date().toISOString() });

    const token = generateToken(user.id);

    res.json({ success: true, message: 'Login successful', data: { user, token, loginMethod: 'otp' } });
  } catch (error) {
    console.error('OTP login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    await updateUser(req.user.id, { refreshToken: null });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const token = generateToken(user.id);
    res.json({ success: true, data: { token } });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  signUp,
  loginWithPassword,
  requestOTP,
  loginWithOTP,
  getCurrentUser,
  logout,
  refreshToken
};
