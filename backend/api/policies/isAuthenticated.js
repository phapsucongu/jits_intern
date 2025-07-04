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
    
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    return proceed();
  } catch (err) {
    sails.log.error('Authentication error:', err);
    return res.forbidden({ error: 'Invalid token', details: err.message });
  }
};
