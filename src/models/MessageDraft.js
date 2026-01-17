const mongoose = require('mongoose');

const messageDraftSchema = new mongoose.Schema({
  memberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Member', 
    required: [true, 'Member is required']
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true
  },
  
  type: { 
    type: String, 
    enum: ['expiry', 'payment', 'welcome', 'offer', 'custom'],
    required: [true, 'Message type is required']
  },
  
  message: { 
    type: String, 
    required: [true, 'Message content is required'],
    trim: true
  },
  
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'failed'],
    default: 'draft' 
  },
  
  // Metadata
  branchId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Branch',
    required: [true, 'Branch is required']
  },
  
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'Created by is required']
  },
  
  sentBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  
  sentAt: {
    type: Date
  },
  
  // For tracking
  channel: { 
    type: String, 
    enum: ['sms', 'whatsapp'],
    default: 'sms' 
  },
  
  failureReason: {
    type: String,
    trim: true
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

// Indexes
messageDraftSchema.index({ status: 1 });
messageDraftSchema.index({ branchId: 1, status: 1 });
messageDraftSchema.index({ type: 1 });
messageDraftSchema.index({ createdAt: -1 });
messageDraftSchema.index({ memberId: 1 });

module.exports = mongoose.model('MessageDraft', messageDraftSchema);
