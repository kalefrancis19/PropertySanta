const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const propertyController = require('../controllers/propertyController');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Property CRUD operations
router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/', propertyController.createProperty);
router.put('/:id', propertyController.updateProperty);
router.delete('/:id', propertyController.deleteProperty);

// Property specific operations
router.get('/:id/manual', propertyController.getPropertyManual);
router.put('/:id/manual', propertyController.updatePropertyManual);
router.patch('/:id/status', propertyController.togglePropertyStatus);

// Room task operations
router.patch('/:propertyId/room-tasks/:taskId/status', propertyController.updateRoomTaskStatus);
router.patch('/:propertyId/room-tasks/:taskId/notes', propertyController.updateRoomTaskNotes);

// Media operations
router.post('/:id/photos', propertyController.addPropertyPhoto);
router.post('/:id/issues', propertyController.addPropertyIssue);

// Stats and reports
router.get('/:id/stats', propertyController.getPropertyStats);

module.exports = router;
