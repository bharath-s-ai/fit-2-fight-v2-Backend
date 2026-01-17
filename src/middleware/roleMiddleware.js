// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    
    next();
  };
};

// Trainer can only view (GET requests)
exports.trainerReadOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }
  
  if (req.user.role === 'trainer' && req.method !== 'GET') {
    return res.status(403).json({
      success: false,
      message: 'Trainers have read-only access. Only admins can create, update, or delete.'
    });
  }
  
  next();
};
