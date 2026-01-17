const mongoose = require('mongoose');

const messageLogSchema = new mongoose.Schema({
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
    required: [true, 'Message type is required']
  },
  message: { 
    type: String, 
    required: [true, 'Message content is required'],
    trim: true
  },
  channel: { 
    type: String, 
    enum: ['sms', 'whatsapp'], 
    required: [true, 'Channel is required']
  },
  
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'failed'],
    default: 'sent' 
  },
  
  branchId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Branch',
    required: [true, 'Branch is required']
  },
  
  sentBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'Sent by is required']
  },
  
  sentAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // Provider response
  providerId: {
    type: String,
    trim: true
  },
  providerResponse: mongoose.Schema.Types.Mixed
}, { 
  timestamps: true 
});

// Indexes
messageLogSchema.index({ memberId: 1 });
messageLogSchema.index({ sentAt: -1 });
messageLogSchema.index({ branchId: 1, sentAt: -1 });
messageLogSchema.index({ status: 1 });

module.exports = mongoose.model('MessageLog', messageLogSchema);
