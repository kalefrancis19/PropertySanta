const { db } = require('../config/firebase');

// -------------------- Helpers -------------------- //
const formatDate = (date) => {
  if (!date) return null;

  // Firestore Timestamps have .toDate()
  const d = date.toDate ? date.toDate() : new Date(date);

  return d.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short' // gives UTC-4 style offset
  });
};

const formatPropertyDates = (property) => {
  if (!property) return property;

  return {
    ...property,
    createdAt: formatDate(property.createdAt),
    updatedAt: formatDate(property.updatedAt),
    manual: property.manual
      ? {
          ...property.manual,
          lastUpdated: formatDate(property.manual.lastUpdated),
        }
      : property.manual,
  };
};

// -------------------- Properties CRUD -------------------- //

// Get all properties
const getAllProperties = async (req, res) => {
  try {
    const snapshot = await db
      .collection('properties')
      .orderBy('createdAt', 'desc')
      .get();

    const properties = snapshot.docs.map((doc) =>
      formatPropertyDates({
        ...doc.data(),
        id: doc.id,
        _id: doc.id, // Add _id for backward compatibility
      })
    );

    res.json({ success: true, properties });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error fetching properties', error: error.message });
  }
};

// Get property by ID
const getPropertyById = async (req, res) => {
  try {
    const doc = await db.collection('properties').doc(req.params.id).get();
    if (!doc.exists)
      return res.status(404).json({ success: false, message: 'Property not found' });

    res.json({
      success: true,
      property: formatPropertyDates({
        ...doc.data(),
        id: doc.id,
        _id: doc.id,
      }),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error fetching property', error: error.message });
  }
};

// Create new property
const createProperty = async (req, res) => {
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
      owner,
    } = req.body;

    if (
      !propertyId ||
      !name ||
      !address ||
      !type ||
      !rooms ||
      !bathrooms ||
      !squareFootage ||
      !estimatedTime
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing required fields' });
    }

    const existing = await db
      .collection('properties')
      .where('propertyId', '==', propertyId)
      .get();
    if (!existing.empty)
      return res
        .status(400)
        .json({ success: false, message: 'Property ID already exists' });

    const now = new Date();
    const data = {
      propertyId,
      name,
      address,
      type,
      rooms,
      bathrooms,
      squareFootage,
      estimatedTime,
      manual:
        manual || {
          title: 'Live Cleaning & Maintenance Manual',
          content: `Live Cleaning & Maintenance Manual\n${address}\nProperty Overview\n- Property ID: ${propertyId}\n- Type: ${type}\n- Square Footage: ${squareFootage} sq ft\n- Estimated Time: ${estimatedTime}`,
          lastUpdated: now,
        },
      roomTasks: roomTasks || [],
      instructions: instructions || '',
      specialRequirements: specialRequirements || '',
      owner: owner || '',
      photos: [],
      issues: [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection('properties').add({
      ...data,
      _id: db.collection('properties').doc().id, // Generate a new ID for _id field
    });

    const createdDoc = await docRef.get();
    res.status(201).json({
      success: true,
      property: formatPropertyDates({
        ...createdDoc.data(),
        id: docRef.id,
        _id: docRef.id,
      }),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error creating property', error: error.message });
  }
};

// Update property
const updateProperty = async (req, res) => {
  try {
    const propertyRef = db.collection('properties').doc(req.params.id);
    const doc = await propertyRef.get();
    if (!doc.exists)
      return res.status(404).json({ success: false, message: 'Property not found' });

    const updates = { ...req.body, updatedAt: new Date() };
    const { _id, ...updatesWithoutId } = updates;
    await propertyRef.set(updatesWithoutId, { merge: true });

    const updatedDoc = await propertyRef.get();
    res.json({
      success: true,
      property: formatPropertyDates({
        ...updatedDoc.data(),
        id: updatedDoc.id,
        _id: updatedDoc.id,
      }),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error updating property', error: error.message });
  }
};

// Delete property
const deleteProperty = async (req, res) => {
  try {
    const propertyRef = db.collection('properties').doc(req.params.id);
    const doc = await propertyRef.get();
    if (!doc.exists)
      return res.status(404).json({ success: false, message: 'Property not found' });

    await propertyRef.delete();
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error deleting property', error: error.message });
  }
};

// -------------------- Property Manual -------------------- //

const getPropertyManual = async (req, res) => {
  try {
    const doc = await db.collection('properties').doc(req.params.id).get();
    if (!doc.exists)
      return res.status(404).json({ success: false, message: 'Property not found' });

    const data = doc.data();
    res.json({
      success: true,
      manual: {
        ...data.manual,
        lastUpdated: formatDate(data.manual?.lastUpdated),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error fetching property manual', error: error.message });
  }
};

const updatePropertyManual = async (req, res) => {
  try {
    const { manual } = req.body;
    if (!manual || !manual.title || !manual.content) {
      return res
        .status(400)
        .json({ success: false, message: 'Manual title and content are required' });
    }

    const propertyRef = db.collection('properties').doc(req.params.id);
    const doc = await propertyRef.get();
    if (!doc.exists)
      return res.status(404).json({ success: false, message: 'Property not found' });

    await propertyRef.set(
      { manual: { ...manual, lastUpdated: new Date() }, updatedAt: new Date() },
      { merge: true }
    );

    const updatedDoc = await propertyRef.get();
    res.json({
      success: true,
      property: formatPropertyDates({
        id: updatedDoc.id,
        ...updatedDoc.data(),
      }),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error updating property manual', error: error.message });
  }
};

// -------------------- Property Status -------------------- //

const togglePropertyStatus = async (req, res) => {
  try {
    const propertyRef = db.collection('properties').doc(req.params.id);
    const doc = await propertyRef.get();
    if (!doc.exists)
      return res.status(404).json({ success: false, message: 'Property not found' });

    const newStatus = !doc.data().isActive;
    await propertyRef.set({ isActive: newStatus, updatedAt: new Date() }, { merge: true });

    const updatedDoc = await propertyRef.get();
    res.json({
      success: true,
      property: formatPropertyDates({ id: updatedDoc.id, ...updatedDoc.data() }),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error toggling property status', error: error.message });
  }
};

// -------------------- Room Tasks -------------------- //

const updateRoomTaskStatus = async (req, res) => {
  try {
    const { propertyId, roomType, taskIndex } = req.params;
    const { isCompleted } = req.body;

    const propertyRef = db.collection('properties').doc(propertyId);
    const doc = await propertyRef.get();
    if (!doc.exists)
      return res.status(404).json({ success: false, message: 'Property not found' });

    const data = doc.data();
    const roomTask = data.roomTasks.find((rt) => rt.roomType === roomType);
    if (!roomTask || !roomTask.tasks[taskIndex])
      return res.status(404).json({ success: false, message: 'Room task not found' });

    roomTask.tasks[taskIndex].isCompleted = isCompleted;
    await propertyRef.set({ roomTasks: data.roomTasks, updatedAt: new Date() }, { merge: true });

    res.json({
      success: true,
      message: 'Room task status updated',
      data: formatPropertyDates({ id: propertyId, ...data }),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateRoomTaskNotes = async (req, res) => {
  try {
    const { propertyId, roomType } = req.params;
    const { notes } = req.body;

    const propertyRef = db.collection('properties').doc(propertyId);
    const doc = await propertyRef.get();
    if (!doc.exists)
      return res.status(404).json({ success: false, message: 'Property not found' });

    const data = doc.data();
    const roomTask = data.roomTasks.find((rt) => rt.roomType === roomType);
    if (!roomTask)
      return res.status(404).json({ success: false, message: 'Room task not found' });

    roomTask.notes = notes;
    await propertyRef.set({ roomTasks: data.roomTasks, updatedAt: new Date() }, { merge: true });

    res.json({
      success: true,
      message: 'Notes updated',
      data: formatPropertyDates({ id: propertyId, ...data }),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};

// -------------------- Photos & Issues -------------------- //

const addPropertyPhoto = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { url, type, notes, localPath, tags } = req.body;

    const propertyRef = db.collection('properties').doc(propertyId);
    const doc = await propertyRef.get();
    if (!doc.exists)
      return res.status(404).json({ success: false, message: 'Property not found' });

    const data = doc.data();
    data.photos.push({ url, type, notes, localPath, tags });
    await propertyRef.set({ photos: data.photos, updatedAt: new Date() }, { merge: true });

    res.json({
      success: true,
      message: 'Photo added',
      data: formatPropertyDates({ id: propertyId, ...data }),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};

const addPropertyIssue = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { type, description, photoId, location, notes } = req.body;

    const propertyRef = db.collection('properties').doc(propertyId);
    const doc = await propertyRef.get();
    if (!doc.exists)
      return res.status(404).json({ success: false, message: 'Property not found' });

    const data = doc.data();
    data.issues.push({ type, description, photoId, location, notes, isResolved: false });
    await propertyRef.set({ issues: data.issues, updatedAt: new Date() }, { merge: true });

    res.json({
      success: true,
      message: 'Issue added',
      data: formatPropertyDates({ id: propertyId, ...data }),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};

// -------------------- Property Stats -------------------- //

const getPropertyStats = async (req, res) => {
  try {
    const snapshot = await db.collection('properties').get();
    let totalTasks = 0,
      completedTasks = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      data.roomTasks.forEach((rt) => {
        totalTasks += rt.tasks.length;
        completedTasks += rt.tasks.filter((t) => t.isCompleted).length;
      });
    });

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        completionRate:
          totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};

// -------------------- Exports -------------------- //

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyManual,
  updatePropertyManual,
  togglePropertyStatus,
  updateRoomTaskStatus,
  updateRoomTaskNotes,
  addPropertyPhoto,
  addPropertyIssue,
  getPropertyStats,
};
