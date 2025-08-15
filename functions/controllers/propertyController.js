const { db } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

// Get all properties
exports.getAllProperties = async (req, res) => {
  try {
    const snapshot = await db.collection('properties')
      .orderBy('createdAt', 'desc')
      .get();
      
    const properties = [];
    snapshot.forEach(doc => {
      properties.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ success: true, properties });
  } catch (error) {
    console.error('Error getting properties:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching properties',
      error: error.message 
    });
  }
};

// Get property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('properties').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }
    
    res.json({ 
      success: true, 
      property: { id: doc.id, ...doc.data() } 
    });
  } catch (error) {
    console.error('Error getting property:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching property',
      error: error.message 
    });
  }
};

// Create new property
exports.createProperty = async (req, res) => {
  try {
    const { 
      propertyId, 
      name, 
      address, 
      type, 
      rooms, 
      bathrooms, 
      squareFootage, 
      estimatedTime, 
      manual, 
      roomTasks, 
      instructions, 
      specialRequirements, 
      owner 
    } = req.body;

    if (!propertyId || !name || !address || !type || !rooms || !bathrooms || !squareFootage || !estimatedTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const propertyData = {
      propertyId,
      name,
      address,
      type,
      rooms: parseInt(rooms),
      bathrooms: parseInt(bathrooms),
      squareFootage: parseInt(squareFootage),
      estimatedTime: parseInt(estimatedTime),
      manual: manual || '',
      roomTasks: roomTasks || [],
      instructions: instructions || '',
      specialRequirements: specialRequirements || '',
      owner: owner || req.user.uid,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('properties').add(propertyData);
    
    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property: { id: docRef.id, ...propertyData }
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating property',
      error: error.message 
    });
  }
};

// Update property
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData._id;
    
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    await db.collection('properties').doc(id).update(updateData);
    
    // Get updated property
    const updatedDoc = await db.collection('properties').doc(id).get();
    
    res.json({
      success: true,
      message: 'Property updated successfully',
      property: { id: updatedDoc.id, ...updatedDoc.data() }
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating property',
      error: error.message 
    });
  }
};

// Delete property
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if property exists
    const doc = await db.collection('properties').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }
    
    // Delete the property
    await db.collection('properties').doc(id).delete();
    
    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting property',
      error: error.message 
    });
  }
};

// Toggle property status
exports.togglePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection('properties').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }
    
    const currentStatus = doc.data().isActive;
    await db.collection('properties').doc(id).update({
      isActive: !currentStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({
      success: true,
      message: `Property ${currentStatus ? 'deactivated' : 'activated'} successfully`,
      isActive: !currentStatus
    });
  } catch (error) {
    console.error('Error toggling property status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error toggling property status',
      error: error.message 
    });
  }
};

// Add photo to property
exports.addPropertyPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { photoUrl, caption } = req.body;
    
    if (!photoUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Photo URL is required' 
      });
    }
    
    const photo = {
      url: photoUrl,
      caption: caption || '',
      uploadedBy: req.user.uid,
      uploadedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('properties').doc(id).update({
      photos: admin.firestore.FieldValue.arrayUnion(photo),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Get updated property
    const updatedDoc = await db.collection('properties').doc(id).get();
    
    res.json({
      success: true,
      message: 'Photo added successfully',
      property: { id: updatedDoc.id, ...updatedDoc.data() }
    });
  } catch (error) {
    console.error('Error adding property photo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding property photo',
      error: error.message 
    });
  }
};

// Get property stats
exports.getPropertyStats = async (req, res) => {
  try {
    const snapshot = await db.collection('properties').get();
    
    let totalProperties = 0;
    let activeProperties = 0;
    let completedTasks = 0;
    let totalTasks = 0;
    
    snapshot.forEach(doc => {
      const property = doc.data();
      totalProperties++;
      
      if (property.isActive) {
        activeProperties++;
      }
      
      // Count tasks if they exist
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
    });
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    res.json({
      success: true,
      stats: {
        totalProperties,
        activeProperties,
        inactiveProperties: totalProperties - activeProperties,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        completionRate
      }
    });
  } catch (error) {
    console.error('Error getting property stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching property stats',
      error: error.message 
    });
  }
};
