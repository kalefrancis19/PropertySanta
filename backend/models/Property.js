const mongoose = require('mongoose');

const roomTaskSchema = new mongoose.Schema({
  roomType: {
    type: String,
    required: true
  },
  tasks: [{
    description: {
      type: String,
      required: true
    },
    Regular:String
  }],
}, { _id: true });

const propertySchema = new mongoose.Schema({
  propertyId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true
  },
  squareFootage: {
    type: Number,
    required: true
  },
  manual: {
    title: {
      type: String,
      default: 'Live Cleaning & Maintenance Manual'
    },
    content: {
      type: String,
      required: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },

  roomTasks: [roomTaskSchema],
 
  customer: String,

  cycle:String,

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