const exportService = require('../services/exportService');

// @desc    Export members to CSV
// @route   GET /api/export/members
// @access  Private
exports.exportMembers = async (req, res, next) => {
  try {
    const { status, membershipType } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (membershipType) filters.membershipType = membershipType;
    
    const csv = await exportService.exportMembers(req.user.branchId, filters);
    
    const filename = `members_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Export payments to CSV
// @route   GET /api/export/payments
// @access  Private
exports.exportPayments = async (req, res, next) => {
  try {
    const { startDate, endDate, memberId } = req.query;
    
    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (memberId) filters.memberId = memberId;
    
    const csv = await exportService.exportPayments(req.user.branchId, filters);
    
    const filename = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Export attendance to CSV
// @route   GET /api/export/attendance
// @access  Private
exports.exportAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate, memberId } = req.query;
    
    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (memberId) filters.memberId = memberId;
    
    const csv = await exportService.exportAttendance(req.user.branchId, filters);
    
    const filename = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
