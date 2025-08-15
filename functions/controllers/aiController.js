const { db } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

// Helper to get manual requirements for a room
const getManualRequirementsForRoom = (property, roomType) => {
  if (!property || !property.roomTasks) return '';
  
  const roomTask = property.roomTasks.find(rt => rt.roomType === roomType);
  if (!roomTask) return '';
  
  let manualRequirements = roomTask.tasks.map(task =>
    `${task.description} (${task.estimatedTime})${task.specialNotes ? ` - ${task.specialNotes}` : ''}`
  ).join('\n');
  
  if (roomTask.specialInstructions && roomTask.specialInstructions.length > 0) {
    manualRequirements += `\nSpecial Instructions: ${roomTask.specialInstructions.join(', ')}`;
  }
  
  if (roomTask.fragileItems && roomTask.fragileItems.length > 0) {
    manualRequirements += `\nFragile Items: ${roomTask.fragileItems.join(', ')}`;
  }
  
  return manualRequirements;
};

// Chat with AI
exports.chatWithAI = async (req, res) => {
  try {
    const { message, propertyId, roomType, completedTasks = [], manualTips } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }
    
    // Get property details if propertyId is provided
    let property = null;
    if (propertyId) {
      const propertyDoc = await db.collection('properties').doc(propertyId).get();
      if (propertyDoc.exists) {
        property = { id: propertyDoc.id, ...propertyDoc.data() };
      }
    }
    
    // Get manual requirements if property and roomType are provided
    let manualRequirements = '';
    if (property && roomType) {
      manualRequirements = getManualRequirementsForRoom(property, roomType);
    }
    
    // Here you would integrate with your AI service (e.g., Gemini, OpenAI, etc.)
    // This is a placeholder response
    const aiResponse = {
      response: `I received your message: "${message}"`,
      suggestions: [
        'Complete the living room tasks first',
        'Check the special instructions for the kitchen',
        'Make sure to document any issues you find'
      ]
    };
    
    // Log the interaction
    const interaction = {
      userId: req.user.uid,
      propertyId: propertyId || null,
      roomType: roomType || null,
      message,
      response: aiResponse,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('aiInteractions').add(interaction);
    
    res.json({
      success: true,
      ...aiResponse
    });
    
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing your request',
      error: error.message
    });
  }
};

// Handle photo upload and analysis
exports.handlePhotoUpload = async (req, res) => {
  try {
    const { photoUrl, propertyId, roomType, taskId, isBeforePhoto } = req.body;
    
    if (!photoUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Photo URL is required' 
      });
    }
    
    // Here you would integrate with your image analysis service
    // This is a placeholder response
    const analysisResult = {
      isClean: Math.random() > 0.5,
      confidence: Math.floor(Math.random() * 100),
      issues: [],
      suggestions: [
        'The floor needs more attention',
        'Check the corners for dust',
        'The windows look clean'
      ]
    };
    
    // Log the photo analysis
    const photoAnalysis = {
      userId: req.user.uid,
      propertyId: propertyId || null,
      roomType: roomType || null,
      taskId: taskId || null,
      isBeforePhoto: isBeforePhoto !== false, // default to true if not specified
      photoUrl,
      analysis: analysisResult,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('photoAnalyses').add(photoAnalysis);
    
    res.json({
      success: true,
      analysis: analysisResult
    });
    
  } catch (error) {
    console.error('Error in handlePhotoUpload:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing photo',
      error: error.message
    });
  }
};

// Score before/after photos
exports.scoreBeforeAfterPhotos = async (req, res) => {
  try {
    const { beforePhotoUrl, afterPhotoUrl, propertyId, roomType, taskId } = req.body;
    
    if (!beforePhotoUrl || !afterPhotoUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both before and after photo URLs are required' 
      });
    }
    
    // Here you would integrate with your image comparison service
    // This is a placeholder response
    const score = Math.floor(Math.random() * 100);
    
    // Log the comparison
    const comparison = {
      userId: req.user.uid,
      propertyId: propertyId || null,
      roomType: roomType || null,
      taskId: taskId || null,
      beforePhotoUrl,
      afterPhotoUrl,
      score,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('photoComparisons').add(comparison);
    
    res.json({
      success: true,
      score,
      feedback: score > 70 ? 'Great job!' : 
                score > 40 ? 'Good, but could be better' : 
                'Needs improvement'
    });
    
  } catch (error) {
    console.error('Error in scoreBeforeAfterPhotos:', error);
    res.status(500).json({
      success: false,
      message: 'Error comparing photos',
      error: error.message
    });
  }
};

// Generate workflow guidance
exports.generateWorkflowGuidance = async (req, res) => {
  try {
    const { propertyId, currentRoom, completedTasks = [] } = req.body;
    
    // Get property details
    let property = null;
    if (propertyId) {
      const propertyDoc = await db.collection('properties').doc(propertyId).get();
      if (propertyDoc.exists) {
        property = { id: propertyDoc.id, ...propertyDoc.data() };
      }
    }
    
    if (!property || !property.roomTasks) {
      return res.status(400).json({ 
        success: false, 
        message: 'Property not found or has no room tasks' 
      });
    }
    
    // Generate workflow guidance based on property and completed tasks
    const rooms = property.roomTasks.map(room => ({
      roomType: room.roomType,
      tasks: room.tasks.map(task => ({
        id: task.id,
        description: task.description,
        estimatedTime: task.estimatedTime,
        isCompleted: completedTasks.includes(task.id)
      }))
    }));
    
    // Simple algorithm to suggest next steps
    const currentRoomIndex = rooms.findIndex(r => r.roomType === currentRoom);
    let nextRoom = null;
    let nextTasks = [];
    
    // If we're in a room with incomplete tasks, suggest those first
    if (currentRoom && currentRoomIndex >= 0) {
      const currentRoomData = rooms[currentRoomIndex];
      const incompleteTasks = currentRoomData.tasks.filter(t => !t.isCompleted);
      
      if (incompleteTasks.length > 0) {
        nextRoom = currentRoom;
        nextTasks = incompleteTasks.slice(0, 3); // Suggest up to 3 next tasks
      }
    }
    
    // If current room is done or not specified, find the next room with tasks
    if (!nextRoom) {
      const nextRoomData = rooms.find(room => 
        room.tasks.some(task => !task.isCompleted)
      );
      
      if (nextRoomData) {
        nextRoom = nextRoomData.roomType;
        nextTasks = nextRoomData.tasks
          .filter(t => !t.isCompleted)
          .slice(0, 3);
      }
    }
    
    res.json({
      success: true,
      currentRoom,
      nextRoom,
      nextTasks,
      progress: {
        totalTasks: rooms.reduce((sum, room) => sum + room.tasks.length, 0),
        completedTasks: rooms.reduce((sum, room) => 
          sum + room.tasks.filter(t => t.isCompleted).length, 0
        )
      },
      suggestions: [
        'Start with the highest priority room',
        'Gather all necessary cleaning supplies before starting',
        'Document any issues you find'
      ]
    });
    
  } catch (error) {
    console.error('Error in generateWorkflowGuidance:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating workflow guidance',
      error: error.message
    });
  }
};
