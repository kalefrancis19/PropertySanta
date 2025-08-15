// controllers/taskController.js
const { db, admin } = require('../config/firebase');
const FieldValue = admin.firestore.FieldValue;

// Admin - Get all room tasks
const getAllTasksAdmin = async (req, res) => {
  try {
    const propertyId = req.query.property;
    let propertiesRef = db.collection('properties');

    if (propertyId) {
      propertiesRef = propertiesRef.where(admin.firestore.FieldPath.documentId(), '==', propertyId);
    }

    const snapshot = await propertiesRef.get();
    const allRoomTasks = [];

    snapshot.forEach(doc => {
      const property = { id: doc.id, ...doc.data() };
      (property.roomTasks || []).forEach((roomTask, idx) => {
        allRoomTasks.push({
          propertyId: property.id,
          propertyName: property.name,
          address: property.address,
          roomTaskIndex: idx,
          ...roomTask
        });
      });
    });

    res.json({ success: true, roomTasks: allRoomTasks });
  } catch (error) {
    console.error('Get all room tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Authenticated user - Get all room tasks
const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const snapshot = await db.collection('properties').where('assignedTo', '==', userId).get();
    const userProperties = [];

    snapshot.forEach(doc => {
      const property = { id: doc.id, ...doc.data() };
      userProperties.push(property);
    });

    res.json({ success: true, data: userProperties });
  } catch (error) {
    console.error('Get user room tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    const snapshot = await db.collection('properties')
      .where('assignedTo', '==', req.user.id)
      .where('roomTasks', 'array-contains', { _id: taskId }) // Firestore cannot query nested objects like Mongo
      .get();

    let taskFound = null;
    let propertyFound = null;

    snapshot.forEach(doc => {
      const property = { id: doc.id, ...doc.data() };
      const task = (property.roomTasks || []).find(rt => rt._id === taskId);
      if (task) {
        taskFound = task;
        propertyFound = property;
      }
    });

    if (!taskFound) return res.status(404).json({ success: false, message: 'Task not found or access denied.' });

    res.json({ success: true, data: { property: propertyFound, ...taskFound } });
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update full task status
const updateTaskStatus = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;
    const validStatuses = ['pending', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Only 'pending' or 'completed' are supported.` });
    }

    const snapshot = await db.collection('properties')
      .where('assignedTo', '==', req.user.id)
      .get();

    let propertyDoc = null;
    let taskIndex = -1;

    snapshot.forEach(doc => {
      const property = doc.data();
      const idx = (property.roomTasks || []).findIndex(rt => rt._id === taskId);
      if (idx !== -1) {
        propertyDoc = doc;
        taskIndex = idx;
      }
    });

    if (!propertyDoc) return res.status(404).json({ success: false, message: 'Task not found or access denied.' });

    const propertyData = propertyDoc.data();
    const newCompletedStatus = status === 'completed';
    propertyData.roomTasks[taskIndex].tasks.forEach(subTask => {
      subTask.isCompleted = newCompletedStatus;
    });

    await propertyDoc.ref.update({ roomTasks: propertyData.roomTasks });
    res.json({ success: true, message: 'Task status updated successfully', data: propertyData.roomTasks[taskIndex] });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Add photo to property
const addPhoto = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { photoUrl, type, notes } = req.body;
    const validTypes = ['before', 'during', 'after'];

    if (!validTypes.includes(type)) return res.status(400).json({ success: false, message: 'Invalid photo type' });

    const snapshot = await db.collection('properties').where('assignedTo', '==', req.user.id).get();
    let propertyDoc = null;

    snapshot.forEach(doc => {
      const property = doc.data();
      const taskExists = (property.roomTasks || []).some(rt => rt._id === taskId);
      if (taskExists) propertyDoc = doc;
    });

    if (!propertyDoc) return res.status(404).json({ success: false, message: 'Task not found or access denied.' });

    const propertyData = propertyDoc.data();
    const photos = propertyData.photos || [];
    const newPhoto = { url: photoUrl, type, notes, createdAt: new Date() };
    photos.push(newPhoto);

    await propertyDoc.ref.update({ photos });
    res.json({ success: true, message: 'Photo added successfully', data: newPhoto });
  } catch (error) {
    console.error('Add photo error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Add issue to property
const addIssue = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { type, description, location, notes } = req.body;

    const snapshot = await db.collection('properties').where('assignedTo', '==', req.user.id).get();
    let propertyDoc = null;

    snapshot.forEach(doc => {
      const property = doc.data();
      const taskExists = (property.roomTasks || []).some(rt => rt._id === taskId);
      if (taskExists) propertyDoc = doc;
    });

    if (!propertyDoc) return res.status(404).json({ success: false, message: 'Task not found or access denied.' });

    const propertyData = propertyDoc.data();
    const issues = propertyData.issues || [];
    const newIssue = { type, description, location, notes, createdAt: new Date() };
    issues.push(newIssue);

    await propertyDoc.ref.update({ issues });
    res.json({ success: true, message: 'Issue added successfully', data: newIssue });
  } catch (error) {
    console.error('Add issue error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update task notes
const updateTaskNotes = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { notes } = req.body;

    if (typeof notes === 'undefined') return res.status(400).json({ success: false, message: '"notes" field is required.' });

    const snapshot = await db.collection('properties').where('assignedTo', '==', req.user.id).get();
    let propertyDoc = null;
    let taskIndex = -1;

    snapshot.forEach(doc => {
      const property = doc.data();
      const idx = (property.roomTasks || []).findIndex(rt => rt._id === taskId);
      if (idx !== -1) {
        propertyDoc = doc;
        taskIndex = idx;
      }
    });

    if (!propertyDoc) return res.status(404).json({ success: false, message: 'Task not found or access denied.' });

    const propertyData = propertyDoc.data();
    propertyData.roomTasks[taskIndex].specialInstructions = Array.isArray(notes) ? notes : [notes];

    await propertyDoc.ref.update({ roomTasks: propertyData.roomTasks });
    res.json({ success: true, message: 'Task notes updated successfully', data: propertyData.roomTasks[taskIndex] });
  } catch (error) {
    console.error('Update task notes error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get task stats
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const snapshot = await db.collection('properties').where('assignedTo', '==', userId).get();

    let totalTasks = 0, completedTasks = 0;
    snapshot.forEach(doc => {
      const property = doc.data();
      (property.roomTasks || []).forEach(rt => {
        totalTasks += rt.tasks.length;
        completedTasks += rt.tasks.filter(t => t.isCompleted).length;
      });
    });

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get property details
const getPropertyDetails = async (req, res) => {
  try {
    const propertyDoc = await db.collection('properties').doc(req.params.propertyId).get();
    const property = propertyDoc.data();

    if (!property || property.assignedTo !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Property not found or access denied.' });
    }

    res.json({ success: true, data: { id: propertyDoc.id, ...property } });
  } catch (error) {
    console.error('Get property details error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update roomTask status
const updateRoomTaskStatus = async (req, res) => {
  try {
    const { roomType, taskIndex, isCompleted } = req.body;

    if (typeof isCompleted !== 'boolean') return res.status(400).json({ success: false, message: 'isCompleted must be a boolean.' });

    const propertyDoc = await db.collection('properties').doc(req.params.propertyId).get();
    const property = propertyDoc.data();

    if (!property || property.assignedTo !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Property not found or access denied.' });
    }

    const roomTask = (property.roomTasks || []).find(rt => rt.roomType === roomType);
    if (!roomTask || !roomTask.tasks[taskIndex]) return res.status(404).json({ success: false, message: 'Task not found.' });

    roomTask.tasks[taskIndex].isCompleted = isCompleted;
    await propertyDoc.ref.update({ roomTasks: property.roomTasks });

    res.json({ success: true, message: 'Room task status updated successfully', data: roomTask });
  } catch (error) {
    console.error('Update room task status error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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
