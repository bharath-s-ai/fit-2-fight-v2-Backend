const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  memberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Member', 
    required: [true, 'Member is required']
  },
  checkInTime: { 
    type: Date, 
    required: [true, 'Check-in time is required']
  },
  checkOutTime: {
    type: Date
  },
  
  branchId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Branch',
    required: [true, 'Branch is required']
  },
  
  remarks: {
    type: String,
    trim: true
  },
  
  // Recorded by (could be self-check-in or staff)
  recordedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Indexes for queries
attendanceSchema.index({ memberId: 1 });
attendanceSchema.index({ checkInTime: -1 });
attendanceSchema.index({ branchId: 1, checkInTime: -1 });
attendanceSchema.index({ memberId: 1, checkInTime: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
