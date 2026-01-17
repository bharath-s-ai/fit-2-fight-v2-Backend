const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const moment = require('moment');

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      memberId,
      startDate,
      endDate
    } = req.query;
    
    const query = { branchId: req.user.branchId };
    
    if (memberId) query.memberId = memberId;
    
    if (startDate || endDate) {
      query.checkInTime = {};
      if (startDate) query.checkInTime.$gte = new Date(startDate);
      if (endDate) query.checkInTime.$lte = new Date(endDate);
    }
    
    const attendance = await Attendance.find(query)
      .populate('memberId', 'name memberId phone')
      .populate('recordedBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ checkInTime: -1 });
    
    const count = await Attendance.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: attendance.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: { attendance }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-in member
// @route   POST /api/attendance/checkin
// @access  Private
exports.checkIn = async (req, res, next) => {
  try {
    const { memberId, remarks } = req.body;
    
    // Check if member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // Check if member belongs to same branch
    if (member.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Member does not belong to your branch'
      });
    }
    
    // Check if member is active
    if (member.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot check-in. Member status is: ${member.status}`
      });
    }
    
    // Check if already checked in today
    const todayStart = moment().startOf('day').toDate();
    const existingCheckIn = await Attendance.findOne({
      memberId,
      checkInTime: { $gte: todayStart },
      checkOutTime: null
    });
    
    if (existingCheckIn) {
      return res.status(400).json({
        success: false,
        message: 'Member is already checked in'
      });
    }
    
    const attendance = await Attendance.create({
      memberId,
      checkInTime: new Date(),
      branchId: req.user.branchId,
      recordedBy: req.user.id,
      remarks
    });
    
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('memberId', 'name memberId phone');
    
    res.status(201).json({
      success: true,
      message: 'Check-in successful',
      data: { attendance: populatedAttendance }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-out member
// @route   PUT /api/attendance/checkout/:id
// @access  Private
exports.checkOut = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    if (attendance.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'Member already checked out'
      });
    }
    
    attendance.checkOutTime = new Date();
    await attendance.save();
    
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('memberId', 'name memberId phone');
    
    res.status(200).json({
      success: true,
      message: 'Check-out successful',
      data: { attendance: populatedAttendance }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's attendance
// @route   GET /api/attendance/today
// @access  Private
exports.getTodayAttendance = async (req, res, next) => {
  try {
    const todayStart = moment().startOf('day').toDate();
    const todayEnd = moment().endOf('day').toDate();
    
    const attendance = await Attendance.find({
      branchId: req.user.branchId,
      checkInTime: { $gte: todayStart, $lte: todayEnd }
    })
      .populate('memberId', 'name memberId phone')
      .sort({ checkInTime: -1 });
    
    res.status(200).json({
      success: true,
      count: attendance.length,
      data: { attendance }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance stats
// @route   GET /api/attendance/stats
// @access  Private
exports.getAttendanceStats = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    
    const startDate = moment().subtract(days, 'days').startOf('day').toDate();
    
    const stats = await Attendance.aggregate([
      {
        $match: {
          branchId: req.user.branchId,
          checkInTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$checkInTime' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};
