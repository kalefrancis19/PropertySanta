const { db, admin } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

const COLLECTION = 'properties';

// Default property structure for validation
const DEFAULT_PROPERTY = {
  name: '',
  address: {},
  type: 'residential',
  status: 'active',
  managerId: null,
  cleanerIds: [],
  roomTasks: [],
  images: [],
  notes: '',
  isActive: true
};

/**
 * Create a new property in Firestore.
 * @param {Object} propertyData - Property data to create
 * @returns {Promise<Object>} Created property with ID
 */
async function createProperty(propertyData) {
  try {
    if (!propertyData.name) {
      throw new Error('Property name is required');
    }

    if (!propertyData.address || !propertyData.address.street) {
      throw new Error('Valid address is required');
    }

    const now = new Date();
    const propertyId = propertyData.propertyId || uuidv4();
    const propertyRef = db.collection(COLLECTION).doc(propertyId);

    // Merge with default values
    const newProperty = {
      ...DEFAULT_PROPERTY,
      ...propertyData,
      propertyId,
      createdAt: now,
      updatedAt: now
    };

    await propertyRef.set(newProperty);
    return { id: propertyId, ...newProperty };
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
}

/**
 * Get a property by its ID.
 * @param {string} propertyId - The property ID
 * @returns {Promise<Object|null>} Property data or null if not found
 */
async function getPropertyById(propertyId) {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    const doc = await db.collection(COLLECTION).doc(propertyId).get();
    
    if (!doc.exists) {
      return null;
    }

    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error(`Error getting property ${propertyId}:`, error);
    throw error;
  }
}

/**
 * Get all active properties.
 * @param {boolean} includeInactive - Whether to include inactive properties
 * @returns {Promise<Array>} Array of property objects
 */
async function getAllProperties(includeInactive = false) {
  try {
    let query = db.collection(COLLECTION);
    
    if (!includeInactive) {
      query = query.where('isActive', '==', true);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all properties:', error);
    throw error;
  }
}

/**
 * Query properties by field with pagination.
 * @param {string} field - Field to filter by
 * @param {any} value - Value to match
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of results
 * @param {string} options.orderBy - Field to order by
 * @param {'asc'|'desc'} options.orderDirection - Sort direction
 * @returns {Promise<Array>} Array of property objects
 */
async function getPropertiesByField(field, value, options = {}) {
  try {
    if (!field || value === undefined) {
      throw new Error('Field and value are required');
    }

    let query = db.collection(COLLECTION).where(field, '==', value);
    
    // Apply sorting if specified
    if (options.orderBy) {
      query = query.orderBy(
        options.orderBy, 
        options.orderDirection || 'asc'
      );
    }
    
    // Apply limit if specified
    if (options.limit) {
      query = query.limit(parseInt(options.limit, 10));
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error querying properties by ${field}:`, error);
    throw error;
  }
}

/**
 * Update a property document.
 * @param {string} propertyId - The property ID to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated property data
 */
async function updateProperty(propertyId, updates) {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    const propertyRef = db.collection(COLLECTION).doc(propertyId);
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // Prevent updating these fields
    delete updateData.id;
    delete updateData.propertyId;
    delete updateData.createdAt;

    await propertyRef.update(updateData);
    
    // Return the updated document
    const updatedDoc = await propertyRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (error) {
    console.error(`Error updating property ${propertyId}:`, error);
    throw error;
  }
}

/**
 * Soft delete a property by ID.
 * @param {string} propertyId - The property ID to delete
 * @returns {Promise<boolean>} True if successful
 */
async function deleteProperty(propertyId) {
  try {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    // Instead of deleting, mark as inactive
    await db.collection(COLLECTION).doc(propertyId).update({
      isActive: false,
      updatedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error(`Error deleting property ${propertyId}:`, error);
    throw error;
  }
}

/**
 * Add a room task to a property.
 * @param {string} propertyId - The property ID
 * @param {Object} roomTask - The room task to add
 * @returns {Promise<Object>} Updated property
 */
async function addRoomTask(propertyId, roomTask) {
  try {
    if (!propertyId || !roomTask) {
      throw new Error('Property ID and room task are required');
    }

    const propertyRef = db.collection(COLLECTION).doc(propertyId);
    const roomTaskId = roomTask.id || uuidv4();
    
    const newRoomTask = {
      ...roomTask,
      id: roomTaskId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    await propertyRef.update({
      roomTasks: admin.firestore.FieldValue.arrayUnion(newRoomTask),
      updatedAt: new Date()
    });

    return getPropertyById(propertyId);
  } catch (error) {
    console.error(`Error adding room task to property ${propertyId}:`, error);
    throw error;
  }
}

/**
 * Get properties with at least one completed task but not fully completed
 * @returns {Promise<Array>} Array of in-progress properties
 */
async function getInProgressProperties() {
  try {
    const properties = await getAllProperties(true);
    
    return properties.filter(property => {
      if (!property.roomTasks || !property.roomTasks.length) return false;
      
      const totalTasks = property.roomTasks.length;
      const completedTasks = property.roomTasks.filter(task => task.isCompleted).length;
      
      return completedTasks > 0 && completedTasks < totalTasks;
    });
  } catch (error) {
    console.error('Error getting in-progress properties:', error);
    throw error;
  }
}

module.exports = {
  createProperty,
  getPropertyById,
  getAllProperties,
  getPropertiesByField,
  updateProperty,
  deleteProperty,
  addRoomTask,
  getInProgressProperties
};
