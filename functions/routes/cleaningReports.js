const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const cleaningReportController = require('../controllers/cleaningReportController');

// All routes require authentication
router.use(verifyToken);

// Get all cleaning reports (admin only)
router.get('/', isAdmin, cleaningReportController.getCleaningReports);

// Get detailed cleaning report for a specific property
router.get('/property/:propertyId', cleaningReportController.getPropertyCleaningReport);

module.exports = router;
