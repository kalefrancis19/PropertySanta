const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const aiController = require('../controllers/aiController');

// All routes require authentication
router.use(verifyToken);

// Chat with AI
router.post('/chat', aiController.chatWithAI);

// Photo handling
router.post('/photos/upload', aiController.handlePhotoUpload);
router.post('/photos/compare', aiController.scoreBeforeAfterPhotos);
router.post('/photos/analyze', aiController.analyzeBeforeAfterPhotos);
router.post('/photos/analyze-with-manual', aiController.analyzePhotoWithManual);

// Workflow guidance
router.post('/workflow/guidance', aiController.generateWorkflowGuidance);
router.get('/workflow/state', aiController.getWorkflowState);
router.post('/workflow/reset', aiController.resetWorkflow);
router.patch('/workflow/progress', aiController.updateWorkflowProgress);

// Context management
router.post('/context/update', aiController.updateContext);
router.post('/context/reset', aiController.resetAIContext);

// Testing
router.post('/test/text-analysis', aiController.testTextAnalysis);

module.exports = router;
