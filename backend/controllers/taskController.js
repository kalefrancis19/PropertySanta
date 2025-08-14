// controllers/taskController.js
const mongoose = require('mongoose');
const Property = require('../models/Property');

// Admin - Get all room tasks
const getAllTasksAdmin = async (req, res) => {
  try {
    const { property } = req.query;
    let properties;

    if (property) {
      properties = await Property.find({ _id: property });
    } else {
      properties = await Property.find({});
    }

    const allRoomTasks = [];
    properties.forEach(prop => {
      prop.roomTasks.forEach((roomTask, idx) => {
        allRoomTasks.push({
          propertyId: prop._id,
          propertyName: prop.name,
          address: prop.address,
          roomTaskIndex: idx,
          ...roomTask.toObject()
        });
      });
    });

    res.json({ success: true, roomTasks: allRoomTasks });
  } catch (error) {
    console.error('Get all room tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Authenticated user - Get all room tasks
const getTasks = async (req, res) => {
  try {
    const properties = await Property.find({ assignedTo: req.user.userId });
    const userRoomTasks = [];
    properties.forEach(prop => {
      prop.roomTasks.forEach((roomTask, idx) => {
        userRoomTasks.push({
          propertyId: prop._id,
          propertyName: prop.name,
          address: prop.address,
          roomTaskIndex: idx,
          ...roomTask.toObject()
        });
      });
    });

    res.json({ success: true, data: properties });
  } catch (error) {
    console.error('Get user room tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    const property = await Property.findOne({
      'roomTasks._id': taskId,
      assignedTo: req.user.userId
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
    }

    const task = property.roomTasks.find(rt => rt._id.toString() === taskId);
    res.json({
      success: true,
      data: {
        property: {
          _id: property._id,
          name: property.name,
          address: property.address,
          type: property.type
        },
        ...task.toObject()
      }
    });
  } catch (error) {
    console.error('Get task by ID error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update full task status
const updateTaskStatus = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;
    const validStatuses = ['pending', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Only 'pending' or 'completed' are supported for this endpoint.` });
    }

    const property = await Property.findOne({
      'roomTasks._id': taskId,
      assignedTo: req.user.userId
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
    }

    const task = property.roomTasks.id(taskId);
    const newCompletedStatus = (status === 'completed');

    task.tasks.forEach(subTask => {
      subTask.isCompleted = newCompletedStatus;
    });

    await property.save();
    res.json({ success: true, message: 'Task status updated successfully', data: task });
  } catch (error) {
    console.error('Update task status error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addPhoto = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { photoUrl, type, notes } = req.body;
    const validTypes = ['before', 'during', 'after'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid photo type' });
    }

    const property = await Property.findOne({
      'roomTasks._id': taskId,
      assignedTo: req.user.userId
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied, cannot add photo.' });
    }

    property.photos.push({ url: photoUrl, type, notes });
    await property.save();

    res.json({
      success: true,
      message: 'Photo added successfully to property',
      data: property.photos[property.photos.length - 1]
    });
  } catch (error) {
    console.error('Add photo error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addIssue = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { type, description, location, notes } = req.body;

    const property = await Property.findOne({
      'roomTasks._id': taskId,
      assignedTo: req.user.userId
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied, cannot add issue.' });
    }

    property.issues.push({ type, description, location, notes });
    await property.save();

    res.json({
      success: true,
      message: 'Issue added successfully to property',
      data: property.issues[property.issues.length - 1]
    });
  } catch (error) {
    console.error('Add issue error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateTaskNotes = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { notes } = req.body;

    if (typeof notes === 'undefined') {
      return res.status(400).json({ success: false, message: '"notes" field is required.' });
    }

    const property = await Property.findOne({
      'roomTasks._id': taskId,
      assignedTo: req.user.userId
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
    }

    const task = property.roomTasks.id(taskId);
    task.specialInstructions = Array.isArray(notes) ? notes : [notes];

    await property.save();
    res.json({ success: true, message: 'Task notes updated successfully', data: task });
  } catch (error) {
    console.error('Update task notes error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getTaskStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const results = await Property.aggregate([
      { $match: { assignedTo: userId } },
      { $unwind: '$roomTasks' },
      {
        $project: {
          isCompleted: { $allElementsTrue: ['$roomTasks.tasks.isCompleted'] }
        }
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] }
          }
        }
      }
    ]);

    let statsData = {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      completionRate: 0
    };

    if (results.length > 0) {
      const { totalTasks, completedTasks } = results[0];
      statsData.totalTasks = totalTasks;
      statsData.completedTasks = completedTasks;
      statsData.pendingTasks = totalTasks - completedTasks;
      statsData.completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;
    }

    res.json({ success: true, data: statsData });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getPropertyDetails = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.propertyId,
      assignedTo: req.user.userId
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found or access denied.' });
    }

    res.json({ success: true, data: property });
  } catch (error) {
    console.error('Get property details error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateRoomTaskStatus = async (req, res) => {
  try {
    const { roomType, taskIndex, isCompleted } = req.body;

    if (typeof isCompleted !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isCompleted must be a boolean.' });
    }

    const property = await Property.findOne({
      _id: req.params.propertyId,
      assignedTo: req.user.userId
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found or access denied.' });
    }

    const roomTask = property.roomTasks.find(rt => rt.roomType === roomType);
    if (!roomTask) {
      return res.status(404).json({ success: false, message: `Room task with type '${roomType}' not found.` });
    }

    if (!roomTask.tasks || !roomTask.tasks[taskIndex]) {
      return res.status(404).json({ success: false, message: `Task at index ${taskIndex} not found.` });
    }

    roomTask.tasks[taskIndex].isCompleted = isCompleted;
    await property.save();

    res.json({ success: true, message: 'Room task status updated successfully', data: roomTask });
  } catch (error) {
    console.error('Update room task status error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllTasksAdmin,
  getTasks,
  getTaskById,
  updateTaskStatus,
  addPhoto,
  addIssue,
  updateTaskNotes,
  getTaskStats,
  getPropertyDetails,
  updateRoomTaskStatus
};
