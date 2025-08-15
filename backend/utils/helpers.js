/**
 * Helper functions for the backend
 */

/**
 * Recursively converts Firestore Timestamps to ISO strings in an object
 * @param {Object|Array} data - The data to process
 * @returns {Object|Array} The processed data with timestamps converted to ISO strings
 */
const formatTimestamps = (data) => {
  if (!data || typeof data !== 'object') return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => formatTimestamps(item));
  }

  // Handle Firestore Timestamp
  if (data.toDate && typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }

  // Handle objects
  const result = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      
      // Recursively process nested objects and arrays
      if (value && typeof value === 'object') {
        result[key] = formatTimestamps(value);
      } else {
        result[key] = value;
      }
    }
  }
  
  return result;
};

module.exports = {
  formatTimestamps
};
