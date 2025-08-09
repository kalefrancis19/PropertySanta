const express = require('express');
const { auth } = require('../middleware/auth');
const geminiService = require('../services/geminiService');
const scoringService = require('../services/scoringService');

const router = express.Router();

// Chat with AI - Updated for workflow management
const chatWithAI = async (req, res) => {
  try {
    const { message, propertyId, roomType, completedTasks, manualTips } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Update AI context with all available information
    const contextUpdates = {
      currentRoom: roomType,
      completedTasks: completedTasks || [],
      manualTips: manualTips || []
    };
    
    geminiService.updateContext(contextUpdates);

    // If propertyId is provided, get property details and update context
    if (propertyId) {
      const Property = require('../models/Property');
      const property = await Property.findById(propertyId);
      if (property) {
        geminiService.updateContext({ 
          currentProperty: property,
          workflowState: geminiService.context.workflowState || 'initial'
        });
      }
    }

    // Generate AI response with workflow management
    const aiResponse = await geminiService.generateChatResponse(message);

    // Return response with current context state
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
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI response'
    });
  }
};

// Handle photo upload with workflow management
const handlePhotoUpload = async (req, res) => {
  try {
    const { photoBase64, photoType, roomType, propertyId, userMessage } = req.body;

    if (!photoBase64) {
      return res.status(400).json({
        success: false,
        message: 'Photo data is required'
      });
    }

    if (!photoType || !roomType) {
      return res.status(400).json({
        success: false,
        message: 'Photo type and room type are required'
      });
    }

    // Update AI context if propertyId is provided
    if (propertyId) {
      const Property = require('../models/Property');
      const property = await Property.findById(propertyId);
      if (property) {
        geminiService.updateContext({ currentProperty: property });
      }
    }

    // Handle photo upload with workflow management
    const result = await geminiService.handlePhotoUpload(photoBase64, photoType, roomType, userMessage);

    res.json({
      success: true,
      data: {
        message: result.message,
        shouldAnalyze: result.shouldAnalyze,
        analysis: result.analysis,
        scoring: result.scoring,
        workflowState: geminiService.context.workflowState,
        beforePhotosLogged: geminiService.context.beforePhotosLogged,
        afterPhotosLogged: geminiService.context.afterPhotosLogged,
        isCompleted: result.isCompleted || false,
        error: result.error || false
      }
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process photo upload'
    });
  }
};

// Score before/after photos with detailed analysis
const scoreBeforeAfterPhotos = async (req, res) => {
  try {
    const { beforePhotoBase64, afterPhotoBase64, roomType, propertyId, taskId } = req.body;

    if (!beforePhotoBase64 || !afterPhotoBase64) {
      return res.status(400).json({
        success: false,
        message: 'Both before and after photos are required'
      });
    }

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required for scoring'
      });
    }

    // Score the photos using the scoring service
    const scoringResult = await scoringService.scoreBeforeAfterPhotos(
      beforePhotoBase64,
      afterPhotoBase64,
      roomType,
      propertyId,
      taskId
    );

    if (!scoringResult.success) {
      return res.status(500).json({
        success: false,
        message: scoringResult.error
      });
    }

    res.json({
      success: true,
      data: scoringResult.data
    });
  } catch (error) {
    console.error('Scoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to score photos'
    });
  }
};

// Analyze before/after photos for scoring
const analyzeBeforeAfterPhotos = async (req, res) => {
  try {
    const { beforePhotoBase64, afterPhotoBase64, roomType, propertyId } = req.body;

    if (!beforePhotoBase64 || !afterPhotoBase64) {
      return res.status(400).json({
        success: false,
        message: 'Both before and after photos are required'
      });
    }

    // Get property and manual requirements
    let manualRequirements = '';
    if (propertyId) {
      const Property = require('../models/Property');
      const property = await Property.findById(propertyId);
      if (property) {
        geminiService.updateContext({ currentProperty: property });
        
        // Get manual requirements for the specific room
        if (roomType && property.roomTasks) {
          const roomTask = property.roomTasks.find(rt => rt.roomType === roomType);
          if (roomTask) {
            manualRequirements = roomTask.tasks.map(task => 
              `${task.description} (${task.estimatedTime})${task.specialNotes ? ` - ${task.specialNotes}` : ''}`
            ).join('\n');
            
            if (roomTask.specialInstructions.length > 0) {
              manualRequirements += `\nSpecial Instructions: ${roomTask.specialInstructions.join(', ')}`;
            }
            if (roomTask.fragileItems.length > 0) {
              manualRequirements += `\nFragile Items: ${roomTask.fragileItems.join(', ')}`;
            }
          }
        }
      }
    }

    // Analyze before/after photos
    const analysis = await geminiService.analyzeBeforeAfterComparison(
      beforePhotoBase64, 
      afterPhotoBase64, 
      roomType, 
      manualRequirements
    );

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Before/After analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze before/after photos'
    });
  }
};

// Analyze single photo with manual requirements
const analyzePhotoWithManual = async (req, res) => {
  try {
    const { photoBase64, photoType, roomType, propertyId } = req.body;

    if (!photoBase64) {
      return res.status(400).json({
        success: false,
        message: 'Photo data is required'
      });
    }

    // Get property and manual requirements
    let manualRequirements = '';
    if (propertyId) {
      const Property = require('../models/Property');
      const property = await Property.findById(propertyId);
      if (property) {
        geminiService.updateContext({ currentProperty: property });
        
        // Get manual requirements for the specific room
        if (roomType && property.roomTasks) {
          const roomTask = property.roomTasks.find(rt => rt.roomType === roomType);
          if (roomTask) {
            manualRequirements = roomTask.tasks.map(task => 
              `${task.description} (${task.estimatedTime})${task.specialNotes ? ` - ${task.specialNotes}` : ''}`
            ).join('\n');
            
            if (roomTask.specialInstructions.length > 0) {
              manualRequirements += `\nSpecial Instructions: ${roomTask.specialInstructions.join(', ')}`;
            }
            if (roomTask.fragileItems.length > 0) {
              manualRequirements += `\nFragile Items: ${roomTask.fragileItems.join(', ')}`;
            }
          }
        }
      }
    }

    // Analyze photo with manual requirements
    const analysis = await geminiService.analyzePhotoWithManual(
      photoBase64, 
      photoType, 
      roomType, 
      manualRequirements
    );

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Photo analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze photo'
    });
  }
};

// Generate workflow guidance based on manual
const generateWorkflowGuidance = async (req, res) => {
  try {
    const { roomType, propertyId, currentProgress } = req.body;

    if (!roomType) {
      return res.status(400).json({
        success: false,
        message: 'Room type is required'
      });
    }

    // Generate workflow guidance using scoring service
    const guidance = await scoringService.generateWorkflowGuidance(
      roomType,
      propertyId,
      currentProgress || 'Starting'
    );

    if (!guidance.success) {
      return res.status(500).json({
        success: false,
        message: guidance.error
      });
    }

    res.json({
      success: true,
      data: guidance.data
    });
  } catch (error) {
    console.error('Workflow guidance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate workflow guidance'
    });
  }
};

// Get workflow state and progress
const getWorkflowState = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const context = geminiService.context;
    
    res.json({
      success: true,
      data: {
        workflowState: context.workflowState,
        beforePhotosLogged: context.beforePhotosLogged,
        afterPhotosLogged: context.afterPhotosLogged,
        currentRoomIndex: context.currentRoomIndex,
        chatHistory: context.chatHistory.slice(-10) // Last 10 messages
      }
    });
  } catch (error) {
    console.error('Get workflow state error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workflow state'
    });
  }
};

// Reset workflow state
const resetWorkflow = async (req, res) => {
  try {
    const { propertyId } = req.body;

    // Reset workflow state
    geminiService.updateContext({
      workflowState: 'initial',
      beforePhotosLogged: [],
      afterPhotosLogged: [],
      currentRoomIndex: 0,
      chatHistory: []
    });

    // Update property if provided
    if (propertyId) {
      const Property = require('../models/Property');
      const property = await Property.findById(propertyId);
      if (property) {
        geminiService.updateContext({ currentProperty: property });
      }
    }

    res.json({
      success: true,
      message: 'Workflow reset successfully'
    });
  } catch (error) {
    console.error('Reset workflow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset workflow'
    });
  }
};

// Get scoring history for a task
const getScoringHistory = async (req, res) => {
  try {
    const { taskId } = req.params;

    const scoringHistory = scoringService.getScoringHistory(taskId);

    if (!scoringHistory) {
      return res.status(404).json({
        success: false,
        message: 'Scoring history not found'
      });
    }

    res.json({
      success: true,
      data: scoringHistory
    });
  } catch (error) {
    console.error('Get scoring history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scoring history'
    });
  }
};

// Get property scoring summary
const getPropertyScoringSummary = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const summary = scoringService.getPropertyScoringSummary(propertyId);

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'No scoring data found for this property'
      });
    }

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get property scoring summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get property scoring summary'
    });
  }
};

// Update workflow progress
const updateWorkflowProgress = async (req, res) => {
  try {
    const { propertyId, roomType, progress } = req.body;

    if (!propertyId || !roomType || !progress) {
      return res.status(400).json({
        success: false,
        message: 'Property ID, room type, and progress are required'
      });
    }

    scoringService.updateWorkflowProgress(propertyId, roomType, progress);

    res.json({
      success: true,
      message: 'Workflow progress updated successfully'
    });
  } catch (error) {
    console.error('Update workflow progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update workflow progress'
    });
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

    res.json({
      success: true,
      message: 'AI context updated successfully'
    });
  } catch (error) {
    console.error('Update context error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update AI context'
    });
  }
};

// Reset AI context for debugging
const resetAIContext = async (req, res) => {
  try {
    geminiService.resetContext();
    res.json({
      success: true,
      message: 'AI context reset successfully',
      data: {
        workflowState: geminiService.context.workflowState,
        chatHistoryLength: geminiService.context.chatHistory.length
      }
    });
  } catch (error) {
    console.error('Reset context error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset AI context'
    });
  }
};

// Get manual requirements for a room
const getManualRequirements = async (req, res) => {
  try {
    const { propertyId, roomType } = req.params;

    if (!propertyId || !roomType) {
      return res.status(400).json({
        success: false,
        message: 'Property ID and room type are required'
      });
    }

    const Property = require('../models/Property');
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const roomTask = property.roomTasks.find(rt => rt.roomType === roomType);
    
    if (!roomTask) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found in property manual'
      });
    }

    const manualRequirements = {
      roomType: roomTask.roomType,
      tasks: roomTask.tasks,
      specialInstructions: roomTask.specialInstructions,
      fragileItems: roomTask.fragileItems
    };

    res.json({
      success: true,
      data: manualRequirements
    });
  } catch (error) {
    console.error('Get manual requirements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get manual requirements'
    });
  }
};

// Test intelligent text analysis
const testTextAnalysis = async (req, res) => {
  try {
    const { userMessage } = req.body;

    if (!userMessage) {
      return res.status(400).json({
        success: false,
        message: 'User message is required'
      });
    }

    // Test the intelligent text analysis
    const analysis = geminiService.analyzeTextForPhotoInfo(userMessage);

    res.json({
      success: true,
      data: {
        originalMessage: userMessage,
        analysis: analysis
      }
    });
  } catch (error) {
    console.error('Text analysis test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze text'
    });
  }
};

// Test endpoint without authentication
router.post('/test-photo-upload', handlePhotoUpload);

// Routes
router.post('/chat', auth, chatWithAI);
router.post('/upload-photo', auth, handlePhotoUpload);
router.post('/score-before-after', auth, scoreBeforeAfterPhotos);
router.post('/analyze-before-after', auth, analyzeBeforeAfterPhotos);
router.post('/analyze-photo-manual', auth, analyzePhotoWithManual);
router.post('/generate-workflow', auth, generateWorkflowGuidance);
router.post('/update-context', auth, updateContext);
router.post('/update-workflow-progress', auth, updateWorkflowProgress);
router.post('/reset-workflow', auth, resetWorkflow);
router.get('/workflow-state/:propertyId', auth, getWorkflowState);
router.get('/manual-requirements/:propertyId/:roomType', auth, getManualRequirements);
router.get('/scoring-history/:taskId', auth, getScoringHistory);
router.get('/property-scoring-summary/:propertyId', auth, getPropertyScoringSummary);
router.post('/reset-context', resetAIContext); // Add the new reset route
router.post('/test-text-analysis', testTextAnalysis); // Add the new test route

module.exports = router; 