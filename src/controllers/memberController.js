const Member = require('../models/Member');
const moment = require('moment');

// Helper function to generate member ID
const generateMemberId = async (branchId) => {
  const year = new Date().getFullYear();
  const count = await Member.countDocuments({ branchId });
  const sequence = (count + 1).toString().padStart(4, '0');
  return `GYM-${year}-${sequence}`;
};

// @desc    Get all members
// @route   GET /api/members
// @access  Private
exports.getMembers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status, 
      membershipType,
      search 
    } = req.query;
    
    const query = { branchId: req.user.branchId };
    
    if (status) query.status = status;
    if (membershipType) query.membershipType = membershipType;
    
    // Search by name, phone, or memberId
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const members = await Member.find(query)
      .select('-__v')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await Member.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: members.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: { members }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single member
// @route   GET /api/members/:id
// @access  Private
exports.getMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('branchId', 'name code')
      .populate('createdBy', 'name email');
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // Check if member belongs to user's branch
    if (member.branchId._id.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this member'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { member }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new member
// @route   POST /api/members
// @access  Private/Admin
exports.createMember = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      dateOfBirth,
      gender,
      membershipType,
      joiningDate,
      membershipFee,
      address,
      city,
      state,
      emergencyContact
    } = req.body;
    
    // Generate member ID
    const memberId = await generateMemberId(req.user.branchId);
    
    // Calculate expiry date based on membership type
    const joiningMoment = moment(joiningDate);
    let expiryDate;
    
    switch (membershipType) {
      case 'monthly':
        expiryDate = joiningMoment.add(1, 'months').toDate();
        break;
      case 'quarterly':
        expiryDate = joiningMoment.add(3, 'months').toDate();
        break;
      case 'halfYearly':
        expiryDate = joiningMoment.add(6, 'months').toDate();
        break;
      case 'yearly':
        expiryDate = joiningMoment.add(1, 'years').toDate();
        break;
      default:
        expiryDate = joiningMoment.add(1, 'months').toDate();
    }
    
    const member = await Member.create({
      memberId,
      name,
      email,
      phone,
      dateOfBirth,
      gender,
      membershipType,
      joiningDate,
      expiryDate,
      membershipFee,
      address,
      city,
      state,
      emergencyContact,
      branchId: req.user.branchId,
      createdBy: req.user.id,
      lastPaymentDate: joiningDate
    });
    
    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: { member }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private/Admin
exports.updateMember = async (req, res, next) => {
  try {
    let member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // Check if member belongs to user's branch
    if (member.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this member'
      });
    }
    
    // Fields that can be updated
    const allowedUpdates = [
      'name', 'email', 'phone', 'dateOfBirth', 'gender',
      'address', 'city', 'state', 'emergencyContact', 'status'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    updates.updatedBy = req.user.id;
    
    member = await Member.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Member updated successfully',
      data: { member }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private/Admin
exports.deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // Check if member belongs to user's branch
    if (member.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this member'
      });
    }
    
    await member.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get members expiring soon
// @route   GET /api/members/expiring-soon
// @access  Private
exports.getExpiringSoon = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    
    const today = moment().startOf('day').toDate();
    const futureDate = moment().add(days, 'days').endOf('day').toDate();
    
    const members = await Member.find({
      branchId: req.user.branchId,
      status: 'active',
      expiryDate: { $gte: today, $lte: futureDate }
    }).sort({ expiryDate: 1 });
    
    res.status(200).json({
      success: true,
      count: members.length,
      data: { members }
    });
  } catch (error) {
    next(error);
  }
};
