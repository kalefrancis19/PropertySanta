const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  signUp,
  loginWithPassword,
  requestOTP,
  loginWithOTP,
  getCurrentUser,
  logout,
  refreshToken
} = require('../controllers/authController');

const router = express.Router();

// Validation rules
const signUpValidation = [
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Please enter a valid phone number')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const otpRequestValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('phone').optional().isMobilePhone().withMessage('Please enter a valid phone number')
];

const otpLoginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 characters')
];

// Routes
router.post('/signup', signUpValidation, signUp);
router.post('/login', loginValidation, loginWithPassword);
router.post('/request-otp', otpRequestValidation, requestOTP);
router.post('/login-otp', otpLoginValidation, loginWithOTP);
router.get('/me', auth, getCurrentUser);
router.post('/logout', auth, logout);
router.post('/refresh', auth, refreshToken);

module.exports = router; 