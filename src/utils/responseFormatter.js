// Standardized response formatters

exports.successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message
  };
  
  if (data) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

exports.errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

exports.paginatedResponse = (res, statusCode, data, pagination) => {
  return res.status(statusCode).json({
    success: true,
    count: data.length,
    total: pagination.total,
    totalPages: pagination.totalPages,
    currentPage: pagination.currentPage,
    data
  });
};
