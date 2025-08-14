const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const taskController = require('../controllers/taskController');

// Admin route
router.get('/admin', taskController.getAllTasksAdmin);

// Authenticated user routes
router.get('/', auth, taskController.getTasks);
router.get('/stats', auth, taskController.getTaskStats);
router.get('/:id', auth, taskController.getTaskById);
router.get('/property/:propertyId', auth, taskController.getPropertyDetails);

router.patch('/:id/status', auth, taskController.updateTaskStatus);
router.patch('/property/:propertyId/room-task', auth, taskController.updateRoomTaskStatus);

router.post('/:id/photos', auth, taskController.addPhoto);
router.post('/:id/issues', auth, taskController.addIssue);

router.patch('/:id/notes', auth, taskController.updateTaskNotes);

module.exports = router;
