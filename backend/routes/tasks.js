const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const taskController = require('../controllers/taskController');

// Admin route
router.get('/admin', auth, taskController.getAllTasksAdmin);

// Authenticated user routes
router.get('/', auth, taskController.getTasks);
router.get('/stats', auth, taskController.getTaskStats);
router.get('/:propertyId/task/:taskId', auth, taskController.getTaskById);
router.get('/property/:propertyId', auth, taskController.getPropertyDetails);

// Task status updates
router.patch('/:propertyId/task/:taskId/status', auth, taskController.updateTaskStatus);
router.patch('/property/:propertyId/room-task/:taskId', auth, taskController.updateRoomTaskStatus);

// Photos and issues
router.post('/:propertyId/task/:taskId/photos', auth, taskController.addPhoto);
router.post('/:propertyId/task/:taskId/issues', auth, taskController.addIssue);

// Task notes
router.patch('/:propertyId/task/:taskId/notes', auth, taskController.updateTaskNotes);

module.exports = router;
