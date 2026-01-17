const { Parser } = require('json2csv');
const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');

// Export members to CSV
exports.exportMembers = async (branchId, filters = {}) => {
  try {
    const query = { branchId, ...filters };
    
    const members = await Member.find(query)
      .select('-__v -createdBy -updatedBy')
      .lean();
    
    // Format data for CSV
    const formattedData = members.map(m => ({
      'Member ID': m.memberId,
      'Name': m.name,
      'Phone': m.phone,
      'Email': m.email || 'N/A',
      'Gender': m.gender || 'N/A',
      'Date of Birth': m.dateOfBirth ? new Date(m.dateOfBirth).toLocaleDateString() : 'N/A',
      'Membership Type': m.membershipType,
      'Joining Date': new Date(m.joiningDate).toLocaleDateString(),
      'Expiry Date': new Date(m.expiryDate).toLocaleDateString(),
      'Status': m.status,
      'Membership Fee': m.membershipFee,
      'Last Payment Date': m.lastPaymentDate ? new Date(m.lastPaymentDate).toLocaleDateString() : 'N/A',
      'Address': m.address || 'N/A',
      'City': m.city || 'N/A',
      'State': m.state || 'N/A',
      'Emergency Contact Name': m.emergencyContact?.name || 'N/A',
      'Emergency Contact Phone': m.emergencyContact?.phone || 'N/A',
      'Created At': new Date(m.createdAt).toLocaleDateString()
    }));
    
    const parser = new Parser();
    const csv = parser.parse(formattedData);
    
    return csv;
  } catch (error) {
    throw new Error(`Failed to export members: ${error.message}`);
  }
};

// Export payments to CSV
exports.exportPayments = async (branchId, filters = {}) => {
  try {
    const query = { branchId };
    
    if (filters.startDate || filters.endDate) {
      query.paymentDate = {};
      if (filters.startDate) query.paymentDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.paymentDate.$lte = new Date(filters.endDate);
    }
    
    if (filters.memberId) {
      query.memberId = filters.memberId;
    }
    
    const payments = await Payment.find(query)
      .populate('memberId', 'name memberId phone')
      .populate('collectedBy', 'name')
      .lean();
    
    const formattedData = payments.map(p => ({
      'Payment ID': p.paymentId,
      'Member ID': p.memberId?.memberId || 'N/A',
      'Member Name': p.memberId?.name || 'N/A',
      'Phone': p.memberId?.phone || 'N/A',
      'Amount': p.amount,
      'Payment Mode': p.paymentMode,
      'Payment Type': p.paymentType,
      'Transaction ID': p.transactionId || 'N/A',
      'Payment Date': new Date(p.paymentDate).toLocaleDateString(),
      'Valid From': new Date(p.validFrom).toLocaleDateString(),
      'Valid Until': new Date(p.validUntil).toLocaleDateString(),
      'Collected By': p.collectedBy?.name || 'N/A',
      'Remarks': p.remarks || 'N/A'
    }));
    
    const parser = new Parser();
    const csv = parser.parse(formattedData);
    
    return csv;
  } catch (error) {
    throw new Error(`Failed to export payments: ${error.message}`);
  }
};

// Export attendance to CSV
exports.exportAttendance = async (branchId, filters = {}) => {
  try {
    const query = { branchId };
    
    if (filters.startDate || filters.endDate) {
      query.checkInTime = {};
      if (filters.startDate) query.checkInTime.$gte = new Date(filters.startDate);
      if (filters.endDate) query.checkInTime.$lte = new Date(filters.endDate);
    }
    
    if (filters.memberId) {
      query.memberId = filters.memberId;
    }
    
    const attendance = await Attendance.find(query)
      .populate('memberId', 'name memberId phone')
      .lean();
    
    const formattedData = attendance.map(a => ({
      'Member ID': a.memberId?.memberId || 'N/A',
      'Member Name': a.memberId?.name || 'N/A',
      'Phone': a.memberId?.phone || 'N/A',
      'Check-In Date': new Date(a.checkInTime).toLocaleDateString(),
      'Check-In Time': new Date(a.checkInTime).toLocaleTimeString(),
      'Check-Out Time': a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString() : 'Not checked out',
      'Duration (minutes)': a.checkOutTime 
        ? Math.round((new Date(a.checkOutTime) - new Date(a.checkInTime)) / 60000) 
        : 'N/A',
      'Remarks': a.remarks || 'N/A'
    }));
    
    const parser = new Parser();
    const csv = parser.parse(formattedData);
    
    return csv;
  } catch (error) {
    throw new Error(`Failed to export attendance: ${error.message}`);
  }
};
