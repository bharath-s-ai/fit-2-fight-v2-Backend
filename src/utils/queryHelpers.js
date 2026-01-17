// Build pagination object
exports.buildPagination = (page = 1, limit = 50, total) => {
  const currentPage = parseInt(page);
  const itemsPerPage = parseInt(limit);
  const totalPages = Math.ceil(total / itemsPerPage);
  
  return {
    currentPage,
    itemsPerPage,
    total,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

// Build query filters
exports.buildQueryFilters = (filters) => {
  const query = {};
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      query[key] = filters[key];
    }
  });
  
  return query;
};

// Build date range query
exports.buildDateRangeQuery = (fieldName, startDate, endDate) => {
  const query = {};
  
  if (startDate || endDate) {
    query[fieldName] = {};
    if (startDate) query[fieldName].$gte = new Date(startDate);
    if (endDate) query[fieldName].$lte = new Date(endDate);
  }
  
  return query;
};

// Build search query (for text search)
exports.buildSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return {};
  
  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };
};
