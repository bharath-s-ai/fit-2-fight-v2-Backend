const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const moment = require('moment');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const branchId = req.user.branchId;
    const today = moment().startOf('day').toDate();
    const thisMonth = moment().startOf('month').toDate();
    const lastMonth = moment().subtract(1, 'month').startOf('month').toDate();
    
    // Total members
    const totalMembers = await Member.countDocuments({ branchId });
    
    // Active members
    const activeMembers = await Member.countDocuments({ 
      branchId, 
      status: 'active' 
    });
    
    // Expired members
    const expiredMembers = await Member.countDocuments({ 
      branchId, 
      status: 'expired' 
    });
    
    // Expiring soon (next 7 days)
    const expiringStart = moment().startOf('day').toDate();
    const expiringEnd = moment().add(7, 'days').endOf('day').toDate();
    const expiringSoon = await Member.countDocuments({
      branchId,
      status: 'active',
      expiryDate: { $gte: expiringStart, $lte: expiringEnd }
    });
    
    // New members this month
    const newMembersThisMonth = await Member.countDocuments({
      branchId,
      joiningDate: { $gte: thisMonth }
    });
    
    // Today's attendance
    const todayAttendance = await Attendance.countDocuments({
      branchId,
      checkInTime: { $gte: today }
    });
    
    // This month's revenue
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          branchId: branchId,
          paymentDate: { $gte: thisMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Last month's revenue for comparison
    const lastMonthRevenue = await Payment.aggregate([
      {
        $match: {
          branchId: branchId,
          paymentDate: { 
            $gte: lastMonth, 
            $lt: thisMonth 
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Today's revenue
    const todayRevenue = await Payment.aggregate([
      {
        $match: {
          branchId: branchId,
          paymentDate: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Recent payments (last 5)
    const recentPayments = await Payment.find({ branchId })
      .populate('memberId', 'name memberId')
      .populate('collectedBy', 'name')
      .sort({ paymentDate: -1 })
      .limit(5);
    
    // Recent check-ins (last 10)
    const recentCheckIns = await Attendance.find({ branchId })
      .populate('memberId', 'name memberId')
      .sort({ checkInTime: -1 })
      .limit(10);
    
    // Calculate revenue growth
    const currentMonthRev = monthlyRevenue[0]?.total || 0;
    const lastMonthRev = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRev > 0 
      ? ((currentMonthRev - lastMonthRev) / lastMonthRev * 100).toFixed(2)
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalMembers,
          activeMembers,
          expiredMembers,
          expiringSoon,
          newMembersThisMonth,
          todayAttendance,
          monthlyRevenue: currentMonthRev,
          monthlyPayments: monthlyRevenue[0]?.count || 0,
          todayRevenue: todayRevenue[0]?.total || 0,
          revenueGrowth: parseFloat(revenueGrowth)
        },
        recentPayments,
        recentCheckIns
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue chart data
// @route   GET /api/dashboard/revenue-chart
// @access  Private
exports.getRevenueChart = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;
    const branchId = req.user.branchId;
    
    const startDate = moment().subtract(months, 'months').startOf('month').toDate();
    
    const revenueData = await Payment.aggregate([
      {
        $match: {
          branchId: branchId,
          paymentDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          monthName: {
            $arrayElemAt: [
              ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              '$_id.month'
            ]
          },
          revenue: '$total',
          payments: '$count'
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: { revenueData }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance chart data
// @route   GET /api/dashboard/attendance-chart
// @access  Private
exports.getAttendanceChart = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const branchId = req.user.branchId;
    
    const startDate = moment().subtract(days, 'days').startOf('day').toDate();
    
    const attendanceData = await Attendance.aggregate([
      {
        $match: {
          branchId: branchId,
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
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          attendance: '$count'
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: { attendanceData }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get membership distribution
// @route   GET /api/dashboard/membership-distribution
// @access  Private
exports.getMembershipDistribution = async (req, res, next) => {
  try {
    const branchId = req.user.branchId;
    
    const distribution = await Member.aggregate([
      {
        $match: { branchId: branchId }
      },
      {
        $group: {
          _id: '$membershipType',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          count: 1
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: { distribution }
    });
  } catch (error) {
    next(error);
  }
};
