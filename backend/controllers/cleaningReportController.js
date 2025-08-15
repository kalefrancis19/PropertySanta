const { db, admin } = require('../config/firebase');

const getCleaningReports = async (req, res) => {
  try {
    // 1. Fetch all active properties directly from Firestore
    const snapshot = await db.collection('properties').where('isActive', '==', true).get();
    const allProperties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`Total properties in database: ${allProperties.length}`);

    // 2. Filter completed or partially completed properties
    const properties = allProperties.filter(prop =>
      prop.completedAt || (prop.roomTasks?.some(rt => rt.tasks?.some(t => t.isCompleted)))
    );
    console.log(`Found ${properties.length} completed or partially completed properties`);

    // 3. Attach assigned cleaner info (first cleaner only)
    for (const prop of properties) {
      if (prop.cleanerIds?.length) {
        const cleanerDoc = await db.collection('users').doc(prop.cleanerIds[0]).get();
        const cleanerData = cleanerDoc.exists ? cleanerDoc.data() : null;
        prop.assignedTo = cleanerData ? { name: cleanerData.name, email: cleanerData.email } : null;
      } else {
        prop.assignedTo = null;
      }
    }

    // 4. Transform properties for frontend
    const reports = properties.map(property => {
      const taskStats = (property.roomTasks || []).reduce((acc, roomTask) => {
        acc.totalTasks += roomTask.tasks?.length || 0;
        acc.completedTasks += roomTask.tasks?.filter(task => task.isCompleted).length || 0;
        return acc;
      }, { totalTasks: 0, completedTasks: 0 });

      let duration = 'N/A';
      if (property.startedAt && property.completedAt) {
        const hours = (new Date(property.completedAt) - new Date(property.startedAt)) / (1000 * 60 * 60);
        duration = `${hours.toFixed(1)} hours`;
      }

      const rooms = [...new Set((property.roomTasks || []).map(room => room.roomType))];

      const unresolvedIssues = (property.issues || [])
        .filter(issue => !issue.isResolved)
        .map(issue => issue.description);

      const notes = (property.issues || [])
        .filter(issue => issue.notes)
        .map(issue => issue.notes)
        .join('\n');

      const completionPercentage = taskStats.totalTasks > 0
        ? Math.round((taskStats.completedTasks / taskStats.totalTasks) * 100)
        : 0;

      const status = completionPercentage === 100 ? 'completed' : 'in-progress';

      return {
        id: property.id,
        date: property.completedAt ? new Date(property.completedAt).toISOString().split('T')[0] : 'N/A',
        cleaner: property.assignedTo?.name || 'Unassigned',
        property: property.name || property.address || 'Unnamed Property',
        duration,
        rating: property.rating || 0,
        photos: property.images?.length || 0,
        rooms,
        issues: unresolvedIssues,
        notes: notes || 'No notes available',
        status,
        completionPercentage,
        cleanerEmail: property.assignedTo?.email || '',
        address: property.address || '',
        completedAt: property.completedAt,
        startedAt: property.startedAt
      };
    });

    res.json({ success: true, properties: reports });

  } catch (error) {
    console.error('Get cleaning reports error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch cleaning reports',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

module.exports = { getCleaningReports };
