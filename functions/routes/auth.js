// functions/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/signup', authController.signUp);
router.post('/login', authController.loginWithPassword);
router.post('/request-otp', authController.requestOTP);  // This function doesn't exist in the controller
router.post('/verify-otp', authController.loginWithOTP); // This function doesn't exist in the controller

// Protected routes (require authentication)
router.get('/me', authController.verifyToken, authController.getCurrentUser);
router.post('/logout', authController.verifyToken, authController.logout);
router.post('/refresh-token', authController.refreshToken);  // This function doesn't exist in the controller

module.exports = router;