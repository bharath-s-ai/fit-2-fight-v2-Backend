const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { 
    type: String, 
    required: [true, 'Payment ID is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  memberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Member', 
    required: [true, 'Member is required']
  },
  amount: { 
    type: Number, 
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  paymentMode: { 
    type: String, 
    enum: ['cash', 'upi', 'card', 'netbanking'],
    required: [true, 'Payment mode is required']
  },
  paymentType: {
    type: String,
    enum: ['membership', 'renewal', 'other'],
    default: 'membership'
  },
  
  // Period this payment covers
  validFrom: { 
    type: Date, 
    required: [true, 'Valid from date is required']
  },
  validUntil: { 
    type: Date, 
    required: [true, 'Valid until date is required']
  },
  
  transactionId: {
    type: String,
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  
  branchId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Branch',
    required: [true, 'Branch is required']
  },
  
  collectedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'Collected by is required']
  },
  
  paymentDate: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

// Indexes
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ memberId: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ branchId: 1 });
paymentSchema.index({ paymentDate: 1, branchId: 1 });
paymentSchema.index({ memberId: 1, paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
