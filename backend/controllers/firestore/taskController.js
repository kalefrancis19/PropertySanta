const { db } = require('../../config/firebase');
const { v4: uuidv4 } = require('uuid');

// Helper function to convert Firestore timestamps to ISO strings
const formatTimestamps = (data) => {
  if (!data) return null;
  
  const formatted = { ...data };
  
  // Convert Firestore Timestamp to ISO string for any timestamp fields
  Object.keys(formatted).forEach(key => {
    if (formatted[key] && typeof formatted[key] === 'object' && 'toDate' in formatted[key]) {
      formatted[key] = formatted[key].toDate().toISOString();
    }
  });
  
  return formatted;
};

// Get all tasks for admin
const getAllTasksAdmin = async (req, res) => {
  try {
    const { property } = req.query;
    let query = db.collection('properties');
    
    if (property) {
      query = query.where('__name__', '==', property);
    }
    
    const snapshot = await query.get();
    const allRoomTasks = [];
    
    snapshot.forEach(doc => {
      const propertyData = { id: doc.id, ...doc.data() };
      
      if (propertyData.roomTasks && Array.isArray(propertyData.roomTasks)) {
        propertyData.roomTasks.forEach((roomTask, idx) => {
          allRoomTasks.push({
            propertyId: doc.id,
            propertyName: propertyData.name,
            address: propertyData.address,
            roomTaskIndex: idx,
            ...roomTask
          });
        });
      }
    });
    
    res.json({ success: true, roomTasks: allRoomTasks });
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
};

// Get tasks for authenticated user
const getTasks = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const snapshot = await db.collection('properties')
      .where('assignedTo', '==', userId)
      .get();
    
    const properties = [];
    snapshot.forEach(doc => {
      properties.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, properties });
  } catch (error) {
    console.error('Error getting user tasks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user tasks' });
  }
};

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const { propertyId, taskId } = req.params;
    
    const propertyDoc = await db.collection('properties').doc(propertyId).get();
    if (!propertyDoc.exists) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    
    const property = { id: propertyDoc.id, ...propertyDoc.data() };
    const roomTask = property.roomTasks && property.roomTasks[taskId];
    
    if (!roomTask) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    
    res.json({ 
      success: true, 
      task: {
        ...roomTask,
        propertyId: property.id,
        propertyName: property.name,
        address: property.address
      }
    });
  } catch (error) {
    console.error('Error getting task by ID:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch task' });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { propertyId, taskId } = req.params;
    const { isCompleted } = req.body;
    
    const propertyRef = db.collection('properties').doc(propertyId);
    const propertyDoc = await propertyRef.get();
    
    if (!propertyDoc.exists) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    
    const property = propertyDoc.data();
    if (!property.roomTasks || !property.roomTasks[taskId]) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    
    // Update the specific task's status
    const updates = {};
    updates[`roomTasks.${taskId}.isCompleted`] = isCompleted;
    updates[`roomTasks.${taskId}.updatedAt`] = new Date();
    
    await propertyRef.update(updates);
    
    res.json({ 
      success: true, 
      message: 'Task status updated successfully',
      task: {
        ...property.roomTasks[taskId],
        isCompleted,
        propertyId: propertyDoc.id,
        propertyName: property.name
      }
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ success: false, error: 'Failed to update task status' });
  }
};

// Add photo to task
const addPhoto = async (req, res) => {
  try {
    const { propertyId, taskId } = req.params;
    const { url, type, tags, notes } = req.body;
    
    const propertyRef = db.collection('properties').doc(propertyId);
    const propertyDoc = await propertyRef.get();
    
    if (!propertyDoc.exists) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    
    const property = propertyDoc.data();
    if (!property.roomTasks || !property.roomTasks[taskId]) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    
    const photo = {
      id: uuidv4(),
      url,
      type,
      tags: tags || [],
      notes: notes || '',
      uploadedAt: new Date(),
      isUploaded: true
    };
    
    // Initialize photos array if it doesn't exist
    const updates = {};
    updates[`roomTasks.${taskId}.photos`] = [
      ...(property.roomTasks[taskId].photos || []),
      photo
    ];
    
    await propertyRef.update(updates);
    
    res.json({ 
      success: true, 
      message: 'Photo added successfully',
      photo: {
        ...photo,
        propertyId,
        taskId
      }
    });
  } catch (error) {
    console.error('Error adding photo:', error);
    res.status(500).json({ success: false, error: 'Failed to add photo' });
  }
};

// Add issue to task
const addIssue = async (req, res) => {
  try {
    const { propertyId, taskId } = req.params;
    const { type, description, severity } = req.body;
    
    const propertyRef = db.collection('properties').doc(propertyId);
    const propertyDoc = await propertyRef.get();
    
    if (!propertyDoc.exists) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    
    const property = propertyDoc.data();
    if (!property.roomTasks || !property.roomTasks[taskId]) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    
    const issue = {
      id: uuidv4(),
      type,
      description,
      severity: severity || 'medium',
      reportedAt: new Date(),
      status: 'open',
      reportedBy: req.user.id
    };
    
    // Initialize issues array if it doesn't exist
    const updates = {};
    updates[`roomTasks.${taskId}.issues`] = [
      ...(property.roomTasks[taskId].issues || []),
      issue
    ];
    
    await propertyRef.update(updates);
    
    res.json({ 
      success: true, 
      message: 'Issue reported successfully',
      issue: {
        ...issue,
        propertyId,
        taskId
      }
    });
  } catch (error) {
    console.error('Error reporting issue:', error);
    res.status(500).json({ success: false, error: 'Failed to report issue' });
  }
};

// Update task notes
const updateTaskNotes = async (req, res) => {
  try {
    const { propertyId, taskId } = req.params;
    const { notes } = req.body;
    
    const propertyRef = db.collection('properties').doc(propertyId);
    const propertyDoc = await propertyRef.get();
    
    if (!propertyDoc.exists) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    
    const property = propertyDoc.data();
    if (!property.roomTasks || !property.roomTasks[taskId]) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    
    const updates = {};
    updates[`roomTasks.${taskId}.notes`] = notes;
    updates[`roomTasks.${taskId}.updatedAt`] = new Date();
    
    await propertyRef.update(updates);
    
    res.json({ 
      success: true, 
      message: 'Task notes updated successfully',
      task: {
        ...property.roomTasks[taskId],
        notes,
        propertyId,
        taskId
      }
    });
  } catch (error) {
    console.error('Error updating task notes:', error);
    res.status(500).json({ success: false, error: 'Failed to update task notes' });
  }
};

// Get task statistics
const getTaskStats = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const snapshot = await db.collection('properties')
      .where('assignedTo', '==', userId)
      .get();
    
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let notStartedTasks = 0;
    
    snapshot.forEach(doc => {
      const property = doc.data();
      if (property.roomTasks && Array.isArray(property.roomTasks)) {
        property.roomTasks.forEach(task => {
          totalTasks++;
          if (task.isCompleted) {
            completedTasks++;
          } else if (task.startedAt) {
            inProgressTasks++;
          } else {
            notStartedTasks++;
          }
        });
      }
    });
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    res.json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        notStartedTasks,
        completionRate
      }
    });
  } catch (error) {
    console.error('Error getting task stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch task statistics' });
  }
};

// Get property details
const getPropertyDetails = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const doc = await db.collection('properties').doc(propertyId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    
    res.json({
      success: true,
      property: formatTimestamps({ id: doc.id, ...doc.data() })
    });
  } catch (error) {
    console.error('Error getting property details:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch property details' });
  }
};

// Update room task status
const updateRoomTaskStatus = async (req, res) => {
  try {
    const { propertyId, taskId } = req.params;
    const { status, startedAt, completedAt } = req.body;
    
    const propertyRef = db.collection('properties').doc(propertyId);
    const propertyDoc = await propertyRef.get();
    
    if (!propertyDoc.exists) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    
    const property = propertyDoc.data();
    if (!property.roomTasks || !property.roomTasks[taskId]) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    
    const updates = {};
    
    if (status !== undefined) {
      updates[`roomTasks.${taskId}.status`] = status;
    }
    
    if (startedAt) {
      updates[`roomTasks.${taskId}.startedAt`] = new Date(startedAt);
    }
    
    if (completedAt) {
      updates[`roomTasks.${taskId}.completedAt`] = new Date(completedAt);
      updates[`roomTasks.${taskId}.isCompleted`] = true;
    }
    
    updates[`roomTasks.${taskId}.updatedAt`] = new Date();
    
    await propertyRef.update(updates);
    
    res.json({
      success: true,
      message: 'Room task status updated successfully',
      task: {
        ...property.roomTasks[taskId],
        ...(status && { status }),
        ...(startedAt && { startedAt: new Date(startedAt) }),
        ...(completedAt && { 
          completedAt: new Date(completedAt),
          isCompleted: true 
        }),
        propertyId,
        taskId
      }
    });
  } catch (error) {
    console.error('Error updating room task status:', error);
    res.status(500).json({ success: false, error: 'Failed to update room task status' });
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
