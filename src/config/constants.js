module.exports = {
  ROLES: {
    ADMIN: 'admin',
    TRAINER: 'trainer'
  },
  
  MEMBER_STATUS: {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    SUSPENDED: 'suspended'
  },
  
  MEMBERSHIP_TYPES: {
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    HALF_YEARLY: 'halfYearly',
    YEARLY: 'yearly'
  },
  
  MESSAGE_TYPES: {
    EXPIRY: 'expiry',
    PAYMENT: 'payment',
    WELCOME: 'welcome',
    OFFER: 'offer',
    CUSTOM: 'custom'
  },
  
  MESSAGE_STATUS: {
    DRAFT: 'draft',
    SENT: 'sent',
    FAILED: 'failed'
  },
  
  PAYMENT_MODES: {
    CASH: 'cash',
    UPI: 'upi',
    CARD: 'card',
    NET_BANKING: 'netbanking'
  },
  
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 200
  }
};
