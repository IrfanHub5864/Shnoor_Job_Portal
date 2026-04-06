const jwt = require('jsonwebtoken');

const getUserFromToken = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new Error('NO_TOKEN');
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

const authenticate = (req, res, next) => {
  try {
    req.user = getUserFromToken(req);
    next();
  } catch (error) {
    if (error.message === 'NO_TOKEN') {
      return res.status(401).json({ message: 'No token provided' });
    }
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

const authenticateRoles = (...roles) => (req, res, next) => {
  try {
    const decoded = getUserFromToken(req);
    if (!roles.includes(decoded.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.message === 'NO_TOKEN') {
      return res.status(401).json({ message: 'No token provided' });
    }
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

const authenticateAdmin = authenticateRoles('admin', 'superadmin');

module.exports = {
  authenticate,
  authenticateAdmin,
  authenticateRoles
};
