const { db } = require('firebase-admin/firestore');

// Get cleaning reports
exports.getCleaningReports = async (req, res) => {
  try {
    // Get all properties that have completed tasks or are marked as completed
    const snapshot = await db.collection('properties')
      .where('roomTasks.tasks.isCompleted', '==', true)
      .get();
    
    console.log(`Found ${snapshot.size} properties with completed tasks`);

    const reports = [];
    
    // Process each property to generate reports
    for (const doc of snapshot.docs) {
      const property = { id: doc.id, ...doc.data() };
      let completedTasks = 0;
      let totalTasks = 0;
      
      // Calculate completion stats
      if (property.roomTasks && Array.isArray(property.roomTasks)) {
        property.roomTasks.forEach(room => {
          if (room.tasks && Array.isArray(room.tasks)) {
            room.tasks.forEach(task => {
              totalTasks++;
              if (task.isCompleted) {
                completedTasks++;
              }
            });
          }
        });
      }
      
      // Only include properties with at least one completed task
      if (completedTasks > 0) {
        reports.push({
          propertyId: property.id,
          propertyName: property.name || 'Unnamed Property',
          address: property.address || 'No address',
          completedAt: property.completedAt ? property.completedAt.toDate().toISOString() : 'In Progress',
          completedTasks,
          totalTasks,
          completionRate: Math.round((completedTasks / totalTasks) * 100),
          lastUpdated: property.updatedAt ? property.updatedAt.toDate().toISOString() : null,
          status: property.status || 'active'
        });
      }
    }
    
    // Sort by completion date or last updated
    reports.sort((a, b) => {
      const dateA = a.completedAt === 'In Progress' ? a.lastUpdated : a.completedAt;
      const dateB = b.completedAt === 'In Progress' ? b.lastUpdated : b.completedAt;
      return new Date(dateB) - new Date(dateA);
    });
    
    res.json({
      success: true,
      count: reports.length,
      reports
    });
    
  } catch (error) {
    console.error('Error generating cleaning reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating cleaning reports',
      error: error.message
    });
  }
};

// Generate detailed cleaning report for a specific property
exports.getPropertyCleaningReport = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const doc = await db.collection('properties').doc(propertyId).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    const property = { id: doc.id, ...doc.data() };
    
    // Process cleaning data
    const report = {
      propertyId: property.id,
      propertyName: property.name || 'Unnamed Property',
      address: property.address || 'No address',
      status: property.status || 'active',
      completedAt: property.completedAt ? property.completedAt.toDate().toISOString() : null,
      lastUpdated: property.updatedAt ? property.updatedAt.toDate().toISOString() : null,
      cleaningHistory: [],
      taskSummary: {
        total: 0,
        completed: 0,
        pending: 0,
        completionRate: 0
      },
      issues: [],
      photos: []
    };
    
    // Process room tasks
    if (property.roomTasks && Array.isArray(property.roomTasks)) {
      property.roomTasks.forEach(room => {
        if (room.tasks && Array.isArray(room.tasks)) {
          room.tasks.forEach(task => {
            report.taskSummary.total++;
            
            if (task.isCompleted) {
              report.taskSummary.completed++;
              
              // Add to cleaning history
              report.cleaningHistory.push({
                room: room.roomType || 'Unknown Room',
                task: task.description || 'Task',
                completedAt: task.completedAt ? task.completedAt.toDate().toISOString() : 'Unknown',
                completedBy: task.completedBy || 'Unknown',
                notes: task.notes || ''
              });
              
              // Add photos if any
              if (task.photos && Array.isArray(task.photos)) {
                task.photos.forEach(photo => {
                  report.photos.push({
                    room: room.roomType || 'Unknown Room',
                    task: task.description || 'Task',
                    url: photo.url,
                    caption: photo.caption || '',
                    uploadedAt: photo.uploadedAt ? photo.uploadedAt.toDate().toISOString() : 'Unknown'
                  });
                });
              }
            } else {
              report.taskSummary.pending++;
            }
            
            // Add issues if any
            if (task.issues && Array.isArray(task.issues)) {
              task.issues.forEach(issue => {
                report.issues.push({
                  room: room.roomType || 'Unknown Room',
                  task: task.description || 'Task',
                  description: issue.description || 'No description',
                  severity: issue.severity || 'medium',
                  status: issue.status || 'open',
                  reportedAt: issue.reportedAt ? issue.reportedAt.toDate().toISOString() : 'Unknown',
                  reportedBy: issue.reportedBy || 'Unknown',
                  notes: issue.notes || ''
                });
              });
            }
          });
        }
      });
    }
    
    // Calculate completion rate
    if (report.taskSummary.total > 0) {
      report.taskSummary.completionRate = Math.round(
        (report.taskSummary.completed / report.taskSummary.total) * 100
      );
    }
    
    // Sort cleaning history by completion date
    report.cleaningHistory.sort((a, b) => 
      new Date(b.completedAt) - new Date(a.completedAt)
    );
    
    // Sort photos by upload date
    report.photos.sort((a, b) => 
      new Date(b.uploadedAt) - new Date(a.uploadedAt)
    );
    
    res.json({
      success: true,
      report
    });
    
  } catch (error) {
    console.error('Error generating property cleaning report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating property cleaning report',
      error: error.message
    });
  }
};
