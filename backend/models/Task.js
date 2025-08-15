const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['before', 'during', 'after'],
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  isUploaded: {
    type: Boolean,
    default: true
  },
  localPath: String,
  tags: [String],
  notes: String,
}, { _id: true });

const issueSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  photoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  },
  location: String,
  notes: String,
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: Date
}, { timestamps: true });

const aiFeedbackSchema = new mongoose.Schema({
  photoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo'
  },
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  },
  feedback: {
    type: String,
    required: true
  },
  improvements: [String],

  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  suggestions: [String],
}, { timestamps: true });

const RequirementSchema = new mongoose.Schema({
  roomType: {
    type: String,
    required: true
  },
  tasks: [{
    description: {
      type: String,
      required: true
    }
  }],
  isCompleted: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const specialRequirementSchema = new mongoose.Schema({
  roomType: {
    type: String,
  },
  tasks: [{
    description: {
      type: String,
    }
  }],
  isCompleted: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const propertySchema = new mongoose.Schema({
  propertyId: {
    type: String,
    required: true,
    unique: true
  },
  requirements: [RequirementSchema],
  specialRequirement: [specialRequirementSchema],
  scheduledTime: Date,

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  photos: [photoSchema],

  issues: [issueSchema],

  aiFeedback: [aiFeedbackSchema],

  chatHistory:String,

  isActive: {
    type: Boolean,
    default: true
  },
}, {
  timestamps: true
});

// Index for efficient queries
propertySchema.index({ address: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ isActive: 1 });
propertySchema.index({ propertyId: 1 });

module.exports = mongoose.model('Property', propertySchema); 