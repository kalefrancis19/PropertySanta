const admin = require('firebase-admin');

// Middleware to verify Firebase ID token
exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: No token provided' 
    });
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: Invalid token' 
    });
  }
};

// Middleware to check if user is admin
exports.isAdmin = async (req, res, next) => {
  try {
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(req.user.uid)
      .get();
      
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: Admin access required' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error verifying admin status' 
    });
  }
};
