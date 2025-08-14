const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const COLLECTION = 'users';
const SALT_ROUNDS = 10;

/**
 * Create a new user with hashed password.
 * @param {Object} userData - User data including email and password
 * @returns {Promise<Object>} Created user data without password
 */
async function createUser(userData) {
  try {
    if (!userData.email) {
      throw new Error('Email is required');
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const now = new Date();
    const userId = userData.id || uuidv4();
    const userRef = db.collection(COLLECTION).doc(userId);
    
    // Hash password if provided
    let hashedPassword = '';
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
    }

    const userPayload = {
      ...userData,
      id: userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
      lastLogin: null,
      isActive: true
    };

    await userRef.set(userPayload, { merge: true });
    return { id: userId, ...sanitizeUser(userPayload) };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Get user by ID.
 * @param {string} id - User ID
 * @returns {Promise<Object|null>} User data without password or null if not found
 */
async function getUserById(id) {
  try {
    if (!id) {
      throw new Error('User ID is required');
    }

    const userDoc = await db.collection(COLLECTION).doc(id).get();
    
    if (!userDoc.exists) {
      return null;
    }

    return { id: userDoc.id, ...sanitizeUser(userDoc.data()) };
  } catch (error) {
    console.error(`Error getting user by ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get user by email.
 * @param {string} email - User's email address
 * @returns {Promise<Object|null>} User data without password or null if not found
 */
async function getUserByEmail(email) {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    const snapshot = await db
      .collection(COLLECTION)
      .where('email', '==', email.toLowerCase().trim())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const userDoc = snapshot.docs[0];
    return { id: userDoc.id, ...sanitizeUser(userDoc.data()) };
  } catch (error) {
    console.error(`Error getting user by email ${email}:`, error);
    throw error;
  }
}

/**
 * Compare plain text password with hashed password.
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match
 */
async function comparePassword(plainPassword, hashedPassword) {
  try {
    if (!plainPassword || !hashedPassword) {
      return false;
    }
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

/**
 * Update user data.
 * @param {string} id - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user data without password
 */
async function updateUser(id, updates) {
  try {
    if (!id) {
      throw new Error('User ID is required');
    }

    const userRef = db.collection(COLLECTION).doc(id);
    const updateData = { ...updates, updatedAt: new Date() };

    // Hash new password if provided
    if (updates.password) {
      updateData.password = await bcrypt.hash(updates.password, SALT_ROUNDS);
    }

    await userRef.update(updateData);
    const updatedUser = await getUserById(id);
    return updatedUser;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
}

/**
 * Soft delete user by setting isActive to false.
 * @param {string} id - User ID
 * @returns {Promise<boolean>} True if successful
 */
async function deleteUser(id) {
  try {
    if (!id) {
      throw new Error('User ID is required');
    }

    await db.collection(COLLECTION).doc(id).update({
      isActive: false,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
}

/**
 * Remove sensitive data from user object.
 * @param {Object} user - User object from database
 * @returns {Object} Sanitized user object without sensitive data
 */
function sanitizeUser(user) {
  if (!user) return null;
  
  const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
  return safeUser;
}

/**
 * Update user's last login timestamp
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function updateLastLogin(userId) {
  try {
    if (!userId) return;
    
    await db.collection(COLLECTION).doc(userId).update({
      lastLogin: new Date()
    });
  } catch (error) {
    console.error(`Error updating last login for user ${userId}:`, error);
    // Don't throw error as this shouldn't fail the login process
  }
}

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  comparePassword,
  updateUser,
  deleteUser,
  updateLastLogin
};
