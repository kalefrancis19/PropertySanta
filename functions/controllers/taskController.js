const { db } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

// Get all tasks for admin
exports.getAllTasksAdmin = async (req, res) => {
  try {
    const snapshot = await db.collection('tasks').get();
    const tasks = [];
    
    snapshot.forEach(doc => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ success: false, message: 'Error fetching tasks' });
  }
};

// Get tasks for current user
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('tasks')
      .where('assignedTo', '==', userId)
      .get();
      
    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Error getting user tasks:', error);
    res.status(500).json({ success: false, message: 'Error fetching tasks' });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const { propertyId, taskId } = req.params;
    const doc = await db.collection('properties')
      .doc(propertyId)
      .collection('tasks')
      .doc(taskId)
      .get();
      
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    res.json({ success: true, task: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({ success: false, message: 'Error fetching task' });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { propertyId, taskId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    
    const taskRef = db.collection('properties')
      .doc(propertyId)
      .collection('tasks')
      .doc(taskId);
      
    await taskRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Get updated task
    const updatedTask = await taskRef.get();
    
    res.json({ 
      success: true, 
      task: { id: updatedTask.id, ...updatedTask.data() } 
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ success: false, message: 'Error updating task status' });
  }
};

// Add photo to task
exports.addPhoto = async (req, res) => {
  try {
    const { propertyId, taskId } = req.params;
    const { photoUrl, caption } = req.body;
    
    if (!photoUrl) {
      return res.status(400).json({ success: false, message: 'Photo URL is required' });
    }
    
    const taskRef = db.collection('properties')
      .doc(propertyId)
      .collection('tasks')
      .doc(taskId);
      
    const photo = {
      url: photoUrl,
      caption: caption || '',
      uploadedBy: req.user.uid,
      uploadedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Add to photos array
    await taskRef.update({
      photos: admin.firestore.FieldValue.arrayUnion(photo),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Get updated task
    const updatedTask = await taskRef.get();
    
    res.json({ 
      success: true, 
      task: { id: updatedTask.id, ...updatedTask.data() } 
    });
  } catch (error) {
    console.error('Error adding photo:', error);
    res.status(500).json({ success: false, message: 'Error adding photo' });
  }
};
