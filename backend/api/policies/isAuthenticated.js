const jwt = require('jsonwebtoken');
module.exports = async function (req, res, proceed) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.forbidden({ error: 'No token provided' });
    
    const jwtSecret = sails.config.custom.JWT_SECRET;
    if (!jwtSecret) {
      sails.log.error('JWT_SECRET is not configured');
      return res.serverError({ error: 'Authentication configuration error' });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, jwtSecret);
    
    // Check if decoded contains a user ID
    if (!decoded || !decoded.id) {
      sails.log.error('Invalid token format: missing user id');
      return res.forbidden({ error: 'Invalid token format' });
    }
    
    // Find the complete user object in the database
    const userId = decoded.id;
    const user = await User.findOne({ id: userId });
    
    if (!user) {
      sails.log.error(`User with ID ${userId} not found`);
      return res.forbidden({ error: 'User not found' });
    }
    
    // Set the full user object for this request
    req.user = decoded;
    req.userId = userId; // Add userId for easier access
    
    return proceed();
  } catch (err) {
    sails.log.error('Authentication error:', err);
    return res.forbidden({ error: 'Invalid token', details: err.message });
  }
};
