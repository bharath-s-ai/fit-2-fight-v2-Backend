const Member = require('../models/Member');
const moment = require('moment');

// Get members based on message type
exports.getMembersForMessageType = async (type, branchId) => {
  let query = { branchId };
  
  switch (type) {
    case 'expiry':
      // Members expiring in next 7 days, not yet notified
      const expiringStart = moment().startOf('day').toDate();
      const expiringEnd = moment().add(7, 'days').endOf('day').toDate();
      query.expiryDate = { $gte: expiringStart, $lte: expiringEnd };
      query.status = 'active';
      query.isExpiryNotified = false;
      break;
      
    case 'welcome':
      // New members joined in last 24 hours
      const yesterday = moment().subtract(24, 'hours').toDate();
      query.joiningDate = { $gte: yesterday };
      break;
      
    case 'payment':
      // Members who haven't paid in 30+ days
      const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
      query.lastPaymentDate = { $lt: thirtyDaysAgo };
      query.status = 'active';
      break;
      
    default:
      return [];
  }
  
  return await Member.find(query);
};

// Generate message text based on type and member
exports.generateMessage = (type, member) => {
  const name = member.name;
  const expiryDate = moment(member.expiryDate).format('DD MMM YYYY');
  const gymName = 'YourGym'; // You can make this configurable
  
  const templates = {
    expiry: `Hi ${name}, your gym membership expires on ${expiryDate}. Please renew to continue enjoying our services. Contact us for renewal. - ${gymName}`,
    
    welcome: `Welcome ${name}! We're excited to have you at ${gymName}. Your membership is active until ${expiryDate}. See you at the gym! - ${gymName}`,
    
    payment: `Hi ${name}, this is a reminder to renew your gym membership. Visit us or call to complete your payment. - ${gymName}`,
    
    offer: `Hi ${name}, special offer just for you! Get 20% off on membership renewal this month. Valid until ${moment().endOf('month').format('DD MMM')}. - ${gymName}`
  };
  
  return templates[type] || `Hi ${name}, this is a message from ${gymName}.`;
};

// Mark members as notified
exports.markMembersAsNotified = async (memberIds) => {
  try {
    await Member.updateMany(
      { _id: { $in: memberIds } },
      { isExpiryNotified: true }
    );
  } catch (error) {
    console.error('Error marking members as notified:', error);
  }
};
