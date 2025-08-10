const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const mongoose = require('mongoose');

// Get all cleaning reports
router.get('/', async (req, res) => {
  try {

    // First, check if there are any properties at all
    const totalProperties = await Property.countDocuments({});
    console.log(`Total properties in database: ${totalProperties}`);
    
    // Find all properties that have been completed OR have completed tasks
    console.log('Fetching properties with completed tasks...');
    const properties = await Property.find({
      $or: [
        { completedAt: { $exists: true, $ne: null } }, // Completed properties
        { 'roomTasks.tasks.isCompleted': true } // Or has at least one completed task
      ]
    })
    .populate('assignedTo', 'name email')
    .sort({ updatedAt: -1 }) // Sort by last updated
    .lean();
    
    console.log(`Found ${properties.length} completed properties`);
    
    // Log all completed properties for debugging
    properties.forEach((prop, index) => {
      console.log(`Property ${index + 1}:`, {
        _id: prop._id,
        name: prop.name || 'Unnamed',
        address: prop.address || 'No address',
        completedAt: prop.completedAt ? new Date(prop.completedAt).toISOString() : 'Not completed',
        roomTasks: prop.roomTasks?.length || 0,
        hasAssignedTo: !!prop.assignedTo,
        assignedTo: prop.assignedTo || 'Unassigned'
      });
    });
    
    // Also check for properties that might be completed but not marked as such
    const potentialCompleted = await Property.find({
      $or: [
        { 'roomTasks.tasks.isCompleted': true },
        { status: 'completed' }
      ]
    }).select('name address completedAt status roomTasks.tasks.isCompleted').lean();
    
    console.log(`Found ${potentialCompleted.length} potentially completed properties:`);
    potentialCompleted.forEach(prop => {
      const completedTasks = prop.roomTasks?.flatMap(rt => 
        rt.tasks?.filter(t => t.isCompleted) || []
      ).length || 0;
      
      console.log('Potential completed property:', {
        _id: prop._id,
        name: prop.name,
        status: prop.status,
        completedAt: prop.completedAt || 'Not set',
        completedTasks: completedTasks,
        roomTasks: prop.roomTasks?.length || 0
      });
    });

    if (!properties || properties.length === 0) {
      return res.status(200).json([]);
    }

    // Transform the data to match the frontend's expected format
    const reports = properties.map(property => {
      // Calculate task statistics
      const taskStats = property.roomTasks.reduce((acc, roomTask) => {
        acc.totalTasks += roomTask.tasks.length;
        acc.completedTasks += roomTask.tasks.filter(task => task.isCompleted).length;
        return acc;
      }, { totalTasks: 0, completedTasks: 0 });

      // Calculate duration if both start and end times are available
      let duration = 'N/A';
      if (property.startedAt && property.completedAt) {
        const hours = (new Date(property.completedAt) - new Date(property.startedAt)) / (1000 * 60 * 60);
        duration = `${hours.toFixed(1)} hours`;
      }

      // Get unique room types
      const rooms = [...new Set(property.roomTasks.map(room => room.roomType))];

      // Get unresolved issues
      const unresolvedIssues = property.issues
        .filter(issue => !issue.isResolved)
        .map(issue => issue.description);

      // Get all notes from issues
      const notes = property.issues
        .filter(issue => issue.notes)
        .map(issue => issue.notes)
        .join('\n');

      // Calculate completion percentage
      const completionPercentage = taskStats.totalTasks > 0
        ? Math.round((taskStats.completedTasks / taskStats.totalTasks) * 100)
        : 0;

      // Determine status based on completion
      let status = 'completed';
      if (completionPercentage < 100) {
        status = 'in-progress';
      }

      return {
        id: property._id.toString(),
        date: new Date(property.completedAt).toISOString().split('T')[0],
        cleaner: property.assignedTo?.name || 'Unassigned',
        property: property.name || property.address || 'Unnamed Property',
        duration,
        rating: property.rating || 0,
        photos: property.photos?.length || 0,
        rooms,
        issues: unresolvedIssues,
        notes: notes || 'No notes available',
        status,
        completionPercentage,
        // Add any additional fields that might be used by the frontend
        cleanerEmail: property.assignedTo?.email || '',
        address: property.address || '',
        completedAt: property.completedAt,
        startedAt: property.startedAt
      };
    });

    // Return the reports in the same format as properties
    res.json({
      success: true,
      properties: reports
    });

  } catch (error) {
    console.error('Get cleaning reports error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch cleaning reports',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

module.exports = router;