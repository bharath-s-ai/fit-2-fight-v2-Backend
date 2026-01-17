const moment = require('moment');

// Calculate expiry date based on membership type
exports.calculateExpiryDate = (startDate, membershipType) => {
  const start = moment(startDate);
  
  switch (membershipType) {
    case 'monthly':
      return start.add(1, 'months').toDate();
    case 'quarterly':
      return start.add(3, 'months').toDate();
    case 'halfYearly':
      return start.add(6, 'months').toDate();
    case 'yearly':
      return start.add(1, 'years').toDate();
    default:
      return start.add(1, 'months').toDate();
  }
};

// Check if date is within range
exports.isDateInRange = (date, startDate, endDate) => {
  const checkDate = moment(date);
  const start = moment(startDate);
  const end = moment(endDate);
  
  return checkDate.isBetween(start, end, null, '[]'); // inclusive
};

// Get date range for today
exports.getTodayRange = () => {
  return {
    start: moment().startOf('day').toDate(),
    end: moment().endOf('day').toDate()
  };
};

// Get date range for this month
exports.getThisMonthRange = () => {
  return {
    start: moment().startOf('month').toDate(),
    end: moment().endOf('month').toDate()
  };
};

// Get date range for last N days
exports.getLastNDaysRange = (days) => {
  return {
    start: moment().subtract(days, 'days').startOf('day').toDate(),
    end: moment().endOf('day').toDate()
  };
};

// Format date for display
exports.formatDate = (date, format = 'DD MMM YYYY') => {
  return moment(date).format(format);
};

// Check if membership is expiring soon
exports.isExpiringSoon = (expiryDate, daysThreshold = 7) => {
  const today = moment().startOf('day');
  const expiry = moment(expiryDate).startOf('day');
  const daysUntilExpiry = expiry.diff(today, 'days');
  
  return daysUntilExpiry >= 0 && daysUntilExpiry <= daysThreshold;
};

// Check if membership has expired
exports.hasExpired = (expiryDate) => {
  return moment(expiryDate).isBefore(moment(), 'day');
};
