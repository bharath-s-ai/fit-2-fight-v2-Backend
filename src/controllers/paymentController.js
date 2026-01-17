const Payment = require('../models/Payment');
const Member = require('../models/Member');
const moment = require('moment');

// Helper function to generate payment ID
const generatePaymentId = async (branchId) => {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const count = await Payment.countDocuments({ branchId });
  const sequence = (count + 1).toString().padStart(4, '0');
  return `PAY-${year}${month}-${sequence}`;
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
exports.getPayments = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      memberId,
      paymentMode,
      startDate,
      endDate
    } = req.query;
    
    const query = { branchId: req.user.branchId };
    
    if (memberId) query.memberId = memberId;
    if (paymentMode) query.paymentMode = paymentMode;
    
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }
    
    const payments = await Payment.find(query)
      .populate('memberId', 'name memberId phone')
      .populate('collectedBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ paymentDate: -1 });
    
    const count = await Payment.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: payments.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: { payments }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('memberId', 'name memberId phone email')
      .populate('collectedBy', 'name email')
      .populate('branchId', 'name code');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check if payment belongs to user's branch
    if (payment.branchId._id.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this payment'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private/Admin
exports.createPayment = async (req, res, next) => {
  try {
    const {
      memberId,
      amount,
      paymentMode,
      paymentType,
      validFrom,
      validUntil,
      transactionId,
      remarks
    } = req.body;
    
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
    
    // Generate payment ID
    const paymentId = await generatePaymentId(req.user.branchId);
    
    const payment = await Payment.create({
      paymentId,
      memberId,
      amount,
      paymentMode,
      paymentType: paymentType || 'membership',
      validFrom,
      validUntil,
      transactionId,
      remarks,
      branchId: req.user.branchId,
      collectedBy: req.user.id
    });
    
    // Update member's expiry date and last payment date
    member.expiryDate = validUntil;
    member.lastPaymentDate = new Date();
    member.status = 'active';
    member.isExpiryNotified = false; // Reset notification flag
    await member.save();
    
    const populatedPayment = await Payment.findById(payment._id)
      .populate('memberId', 'name memberId phone')
      .populate('collectedBy', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: { payment: populatedPayment }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment stats
// @route   GET /api/payments/stats
// @access  Private
exports.getPaymentStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = { branchId: req.user.branchId };
    
    if (startDate || endDate) {
      matchQuery.paymentDate = {};
      if (startDate) matchQuery.paymentDate.$gte = new Date(startDate);
      if (endDate) matchQuery.paymentDate.$lte = new Date(endDate);
    }
    
    const stats = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentMode',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalRevenue = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        byPaymentMode: stats,
        overall: totalRevenue[0] || { total: 0, count: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
};
