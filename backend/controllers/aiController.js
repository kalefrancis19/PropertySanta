// controllers/aiController.js
const { db } = require('../config/firebase'); // Firestore instance
const geminiService = require('../services/geminiService');
const scoringService = require('../services/scoringService');

// Helper: get manual requirements for a room
const getManualRequirementsForRoom = (propertyData, roomType) => {
  if (!propertyData?.roomTasks) return '';
  const roomTask = propertyData.roomTasks.find(rt => rt.roomType === roomType);
  if (!roomTask) return '';

  let manualRequirements = roomTask.tasks.map(task =>
    `${task.description} (${task.estimatedTime})${task.specialNotes ? ` - ${task.specialNotes}` : ''}`
  ).join('\n');

  if (roomTask.specialInstructions?.length) {
    manualRequirements += `\nSpecial Instructions: ${roomTask.specialInstructions.join(', ')}`;
  }
  if (roomTask.fragileItems?.length) {
    manualRequirements += `\nFragile Items: ${roomTask.fragileItems.join(', ')}`;
  }
  return manualRequirements;
};

// -------------------- Controllers -------------------- //

// Chat with AI
const chatWithAI = async (req, res) => {
  try {
    const { message, propertyId, roomType, completedTasks, manualTips } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    geminiService.updateContext({
      currentRoom: roomType,
      completedTasks: completedTasks || [],
      manualTips: manualTips || []
    });

    if (propertyId) {
      const doc = await db.collection('properties').doc(propertyId).get();
      const property = doc.exists ? { id: doc.id, ...doc.data() } : null;
      if (property) geminiService.updateContext({ currentProperty: property, workflowState: geminiService.context.workflowState || 'initial' });
    }

    const aiResponse = await geminiService.generateChatResponse(message);

    res.json({
      success: true,
      data: {
        message: aiResponse,
        timestamp: new Date().toISOString(),
        workflowState: geminiService.context.workflowState,
        beforePhotosLogged: geminiService.context.beforePhotosLogged,
        afterPhotosLogged: geminiService.context.afterPhotosLogged,
        currentRoom: geminiService.context.currentRoom,
        chatHistoryLength: geminiService.context.chatHistory.length
      }
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate AI response' });
  }
};

// Handle photo upload
const handlePhotoUpload = async (req, res) => {
  try {
    const { photoBase64, photoType, roomType, propertyId, userMessage } = req.body;
    
    // Input validation
    if (!photoBase64) return res.status(400).json({ success: false, message: 'Photo data is required' });
    if (!photoType || !roomType) return res.status(400).json({ 
      success: false, 
      message: 'Photo type and room type are required' 
    });
    if (!propertyId) return res.status(400).json({ 
      success: false, 
      message: 'Property ID is required' 
    });

    console.log(`[Photo Upload] Property ID: ${propertyId}, Room: ${roomType}, Type: ${photoType}`);
    
    // Load property from Firestore
    const doc = await db.collection('properties').doc(propertyId).get();
    if (!doc.exists) {
      console.error(`[Photo Upload] Property not found: ${propertyId}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }
    
    // Prepare property data with ID
    const property = { 
      id: doc.id, 
      ...doc.data(),
      // Ensure roomTasks exists
      roomTasks: doc.data().roomTasks || []
    };
    
    console.log(`[Photo Upload] Loaded property: ${propertyId} with ${property.roomTasks?.length || 0} room tasks`);
    
    // Update context with the loaded property
    geminiService.updateContext({ 
      currentProperty: property,
      // Preserve existing context or initialize if needed
      photos: geminiService.context.photos || [],
      completedTasks: geminiService.context.completedTasks || []
    });
    
    console.log(`[Photo Upload] Context updated for property: ${propertyId}`);
    
    // Process the photo upload
    const result = await geminiService.handlePhotoUpload(photoBase64, photoType, roomType, userMessage);
    
    // Return response with current state
    res.json({ 
      success: true, 
      data: { 
        ...result, 
        workflowState: geminiService.context.workflowState,
        propertyId: propertyId
      } 
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to process photo upload' });
  }
};

// Score before/after photos
const scoreBeforeAfterPhotos = async (req, res) => {
  try {
    const { beforePhotoBase64, afterPhotoBase64, roomType, propertyId, taskId } = req.body;
    if (!beforePhotoBase64 || !afterPhotoBase64) return res.status(400).json({ success: false, message: 'Both before and after photos are required' });
    if (!taskId) return res.status(400).json({ success: false, message: 'Task ID is required for scoring' });

    const scoringResult = await scoringService.scoreBeforeAfterPhotos(beforePhotoBase64, afterPhotoBase64, roomType, propertyId, taskId);
    if (!scoringResult.success) return res.status(500).json({ success: false, message: scoringResult.error });

    res.json({ success: true, data: scoringResult.data });
  } catch (error) {
    console.error('Scoring error:', error);
    res.status(500).json({ success: false, message: 'Failed to score photos' });
  }
};

// Analyze before/after photos
const analyzeBeforeAfterPhotos = async (req, res) => {
  try {
    const { beforePhotoBase64, afterPhotoBase64, roomType, propertyId } = req.body;
    if (!beforePhotoBase64 || !afterPhotoBase64) return res.status(400).json({ success: false, message: 'Both before and after photos are required' });

    let manualRequirements = '';
    if (propertyId) {
      const doc = await db.collection('properties').doc(propertyId).get();
      const property = doc.exists ? { id: doc.id, ...doc.data() } : null;
      if (property) {
        geminiService.updateContext({ currentProperty: property });
        manualRequirements = getManualRequirementsForRoom(property, roomType);
      }
    }

    const analysis = await geminiService.analyzeBeforeAfterComparison(beforePhotoBase64, afterPhotoBase64, roomType, manualRequirements);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Before/After analysis error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze before/after photos' });
  }
};

// Analyze single photo with manual requirements
const analyzePhotoWithManual = async (req, res) => {
  try {
    const { photoBase64, photoType, roomType, propertyId } = req.body;
    if (!photoBase64) return res.status(400).json({ success: false, message: 'Photo data is required' });

    let manualRequirements = '';
    if (propertyId) {
      const doc = await db.collection('properties').doc(propertyId).get();
      const property = doc.exists ? { id: doc.id, ...doc.data() } : null;
      if (property) {
        geminiService.updateContext({ currentProperty: property });
        manualRequirements = getManualRequirementsForRoom(property, roomType);
      }
    }

    const analysis = await geminiService.analyzePhotoWithManual(photoBase64, photoType, roomType, manualRequirements);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Photo analysis error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze photo' });
  }
};

// Generate workflow guidance
const generateWorkflowGuidance = async (req, res) => {
  try {
    const { roomType, propertyId, currentProgress } = req.body;
    if (!roomType) return res.status(400).json({ success: false, message: 'Room type is required' });

    const guidance = await scoringService.generateWorkflowGuidance(roomType, propertyId, currentProgress || 'Starting');
    if (!guidance.success) return res.status(500).json({ success: false, message: guidance.error });

    res.json({ success: true, data: guidance.data });
  } catch (error) {
    console.error('Workflow guidance error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate workflow guidance' });
  }
};

// Get workflow state
const getWorkflowState = async (req, res) => {
  try {
    const context = geminiService.context;
    res.json({
      success: true,
      data: {
        workflowState: context.workflowState,
        beforePhotosLogged: context.beforePhotosLogged,
        afterPhotosLogged: context.afterPhotosLogged,
        currentRoomIndex: context.currentRoomIndex,
        chatHistory: (context.chatHistory || []).slice(-10)
      }
    });
  } catch (error) {
    console.error('Get workflow state error:', error);
    res.status(500).json({ success: false, message: 'Failed to get workflow state' });
  }
};

// Reset workflow
const resetWorkflow = async (req, res) => {
  try {
    const { propertyId } = req.body;
    geminiService.updateContext({
      workflowState: 'initial',
      beforePhotosLogged: [],
      afterPhotosLogged: [],
      currentRoomIndex: 0,
      chatHistory: []
    });

    if (propertyId) {
      const doc = await db.collection('properties').doc(propertyId).get();
      const property = doc.exists ? { id: doc.id, ...doc.data() } : null;
      if (property) geminiService.updateContext({ currentProperty: property });
    }

    res.json({ success: true, message: 'Workflow reset successfully' });
  } catch (error) {
    console.error('Reset workflow error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset workflow' });
  }
};

// Update AI context
const updateContext = async (req, res) => {
  try {
    const { currentProperty, currentRoom, completedTasks, photos, manualTips, currentWorkflow } = req.body;
    geminiService.updateContext({
      currentProperty,
      currentRoom,
      completedTasks: completedTasks || [],
      photos: photos || { before: [], after: [], during: [] },
      manualTips: manualTips || [],
      currentWorkflow: currentWorkflow || []
    });
    res.json({ success: true, message: 'AI context updated successfully' });
  } catch (error) {
    console.error('Update context error:', error);
    res.status(500).json({ success: false, message: 'Failed to update AI context' });
  }
};

// Reset AI context
const resetAIContext = async (req, res) => {
  try {
    geminiService.resetContext();
    res.json({
      success: true,
      message: 'AI context reset successfully',
      data: { workflowState: geminiService.context.workflowState, chatHistoryLength: geminiService.context.chatHistory.length }
    });
  } catch (error) {
    console.error('Reset context error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset AI context' });
  }
};

// Get manual requirements
const getManualRequirements = async (req, res) => {
  try {
    const { propertyId, roomType } = req.params;
    if (!propertyId || !roomType) return res.status(400).json({ success: false, message: 'Property ID and room type are required' });

    const doc = await db.collection('properties').doc(propertyId).get();
    const property = doc.exists ? { id: doc.id, ...doc.data() } : null;
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const roomTask = property.roomTasks.find(rt => rt.roomType === roomType);
    if (!roomTask) return res.status(404).json({ success: false, message: 'Room type not found in property manual' });

    res.json({ success: true, data: roomTask });
  } catch (error) {
    console.error('Get manual requirements error:', error);
    res.status(500).json({ success: false, message: 'Failed to get manual requirements' });
  }
};

// Test intelligent text analysis
const testTextAnalysis = async (req, res) => {
  try {
    const { userMessage } = req.body;
    if (!userMessage) return res.status(400).json({ success: false, message: 'User message is required' });

    const analysis = geminiService.analyzeTextForPhotoInfo(userMessage);
    res.json({ success: true, data: { originalMessage: userMessage, analysis } });
  } catch (error) {
    console.error('Text analysis test error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze text' });
  }
};

module.exports = {
  chatWithAI,
  handlePhotoUpload,
  scoreBeforeAfterPhotos,
  analyzeBeforeAfterPhotos,
  analyzePhotoWithManual,
  generateWorkflowGuidance,
  getWorkflowState,
  resetWorkflow,
  updateContext,
  resetAIContext,
  getManualRequirements,
  testTextAnalysis,
  updateWorkflowProgress: async (req, res) => {
    try {
      const { propertyId } = req.params;
      const { progressData } = req.body;
      const userId = req.user.uid;

      if (!propertyId || !progressData) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      // Update the workflow progress in Firestore
      const workflowRef = db.collection('workflows').doc(`${userId}_${propertyId}`);
      await workflowRef.set({
        ...progressData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      res.json({ success: true, message: 'Workflow progress updated successfully' });
    } catch (error) {
      console.error('Error updating workflow progress:', error);
      res.status(500).json({ success: false, message: 'Failed to update workflow progress' });
    }
  }
};
