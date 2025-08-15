const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const taskController = require('../controllers/taskController');

// Admin route - requires admin role
router.get('/admin', verifyToken, isAdmin, taskController.getAllTasksAdmin);

// Authenticated user routes
router.get('/', verifyToken, taskController.getTasks);
router.get('/stats', verifyToken, taskController.getTaskStats);
router.get('/:propertyId/task/:taskId', verifyToken, taskController.getTaskById);
router.get('/property/:propertyId', verifyToken, taskController.getPropertyDetails);

// Task status updates
router.patch('/:propertyId/task/:taskId/status', verifyToken, taskController.updateTaskStatus);
router.patch('/property/:propertyId/room-task/:taskId', verifyToken, taskController.updateRoomTaskStatus);

// Photos and issues
router.post('/:propertyId/task/:taskId/photos', verifyToken, taskController.addPhoto);
router.post('/:propertyId/task/:taskId/issues', verifyToken, taskController.addIssue);

// Task notes
router.patch('/:propertyId/task/:taskId/notes', verifyToken, taskController.updateTaskNotes);

module.exports = router;
