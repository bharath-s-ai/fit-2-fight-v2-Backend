const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  memberId: { 
    type: String, 
    required: [true, 'Member ID is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  email: { 
    type: String, 
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other']
  },
  
  // Membership details
  membershipType: { 
    type: String, 
    enum: ['monthly', 'quarterly', 'halfYearly', 'yearly'],
    required: [true, 'Membership type is required']
  },
  joiningDate: { 
    type: Date, 
    required: [true, 'Joining date is required']
  },
  expiryDate: { 
    type: Date, 
    required: [true, 'Expiry date is required']
  },
  
  // Status tracking
  status: { 
    type: String, 
    enum: ['active', 'expired', 'suspended'],
    default: 'active'
  },
  isExpiryNotified: { 
    type: Boolean, 
    default: false 
  },
  
  // Payment info
  membershipFee: { 
    type: Number, 
    required: [true, 'Membership fee is required']
  },
  lastPaymentDate: {
    type: Date
  },
  
  // Branch
  branchId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Branch',
    required: [true, 'Branch is required']
  },
  
  // Additional info
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  
  // Metadata
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

// Indexes for performance
memberSchema.index({ memberId: 1 });
memberSchema.index({ phone: 1 });
memberSchema.index({ email: 1 });
memberSchema.index({ branchId: 1 });
memberSchema.index({ expiryDate: 1 });
memberSchema.index({ status: 1 });
memberSchema.index({ expiryDate: 1, status: 1 }); // Compound for expiry checks
memberSchema.index({ branchId: 1, status: 1 });
memberSchema.index({ branchId: 1, expiryDate: 1 });

module.exports = mongoose.model('Member', memberSchema);
