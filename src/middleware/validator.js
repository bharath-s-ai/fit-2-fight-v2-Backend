// Validate MongoDB ObjectId
exports.validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const mongoose = require('mongoose');
    const id = req.params[paramName];
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }
    
    next();
  };
};

// Validate pagination params
exports.validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(page) || page < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid page number'
    });
  }
  
  if (limit && (isNaN(limit) || limit < 1 || limit > 200)) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 200'
    });
  }
  
  next();
};

// Validate date range
exports.validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && isNaN(Date.parse(startDate))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid start date format'
    });
  }
  
  if (endDate && isNaN(Date.parse(endDate))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid end date format'
    });
  }
  
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({
      success: false,
      message: 'Start date cannot be after end date'
    });
  }
  
  next();
};
