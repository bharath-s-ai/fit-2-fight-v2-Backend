const MessageDraft = require('../models/MessageDraft');
const MessageLog = require('../models/MessageLog');
const Member = require('../models/Member');
const messageService = require('../services/messageService');
const smsService = require('../services/smsService');

// @desc    Generate draft messages
// @route   POST /api/messages/drafts/generate
// @access  Private/Admin
exports.generateDrafts = async (req, res, next) => {
  try {
    const { type, memberIds } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Message type is required'
      });
    }
    
    let members;
    
    if (memberIds && memberIds.length > 0) {
      // Generate for specific members
      members = await Member.find({ 
        _id: { $in: memberIds },
        branchId: req.user.branchId 
      });
    } else {
      // Auto-generate based on type
      members = await messageService.getMembersForMessageType(type, req.user.branchId);
    }
    
    if (members.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No members found for this message type'
      });
    }
    
    const drafts = [];
    
    for (const member of members) {
      // Check if draft already exists
      const existingDraft = await MessageDraft.findOne({
        memberId: member._id,
        type,
        status: 'draft'
      });
      
      if (existingDraft) {
        continue; // Skip if draft already exists
      }
      
      const message = messageService.generateMessage(type, member);
      
      const draft = await MessageDraft.create({
        memberId: member._id,
        phone: member.phone,
        type,
        message,
        status: 'draft',
        branchId: req.user.branchId,
        createdBy: req.user.id
      });
      
      drafts.push(draft);
    }
    
    res.status(201).json({
      success: true,
      message: `${drafts.length} draft(s) generated successfully`,
      count: drafts.length,
      data: { drafts }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all draft messages
// @route   GET /api/messages/drafts
// @access  Private
exports.getDrafts = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 50 } = req.query;
    
    const query = { branchId: req.user.branchId };
    
    if (status) query.status = status;
    if (type) query.type = type;
    
    const drafts = await MessageDraft.find(query)
      .populate('memberId', 'name phone memberId')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await MessageDraft.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: drafts.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: { drafts }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single draft
// @route   GET /api/messages/drafts/:id
// @access  Private
exports.getDraft = async (req, res, next) => {
  try {
    const draft = await MessageDraft.findById(req.params.id)
      .populate('memberId', 'name phone memberId email')
      .populate('createdBy', 'name');
    
    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found'
      });
    }
    
    // Check if draft belongs to user's branch
    if (draft.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this draft'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { draft }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a draft message
// @route   PUT /api/messages/drafts/:id
// @access  Private/Admin
exports.updateDraft = async (req, res, next) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    let draft = await MessageDraft.findById(req.params.id);
    
    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found'
      });
    }
    
    // Check if draft belongs to user's branch
    if (draft.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this draft'
      });
    }
    
    if (draft.status !== 'draft') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot edit sent or failed messages' 
      });
    }
    
    draft.message = message;
    await draft.save();
    
    res.status(200).json({
      success: true,
      message: 'Draft updated successfully',
      data: { draft }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send messages (single or bulk)
// @route   POST /api/messages/send
// @access  Private/Admin
exports.sendMessages = async (req, res, next) => {
  try {
    const { draftIds, channel = 'sms' } = req.body;
    
    if (!draftIds || draftIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Draft IDs are required'
      });
    }
    
    const drafts = await MessageDraft.find({
      _id: { $in: draftIds },
      branchId: req.user.branchId,
      status: 'draft'
    }).populate('memberId');
    
    if (drafts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid drafts found'
      });
    }
    
    const results = [];
    
    for (const draft of drafts) {
      try {
        // Send via SMS (or WhatsApp in future)
        let result;
        if (channel === 'sms') {
          result = await smsService.sendSMS(draft.phone, draft.message);
        } else if (channel === 'whatsapp') {
          // Future: whatsappService.sendWhatsAppMessage()
          throw new Error('WhatsApp not implemented yet');
        } else {
          throw new Error('Invalid channel');
        }
        
        // Update draft status
        draft.status = 'sent';
        draft.sentBy = req.user.id;
        draft.sentAt = new Date();
        draft.channel = channel;
        await draft.save();
        
        // Create log entry
        await MessageLog.create({
          memberId: draft.memberId._id,
          phone: draft.phone,
          type: draft.type,
          message: draft.message,
          channel,
          status: 'sent',
          branchId: draft.branchId,
          sentBy: req.user.id,
          providerId: result.messageId,
          providerResponse: result
        });
        
        // Mark member as notified if expiry message
        if (draft.type === 'expiry') {
          await Member.findByIdAndUpdate(draft.memberId._id, {
            isExpiryNotified: true
          });
        }
        
        results.push({ 
          draftId: draft._id, 
          status: 'sent',
          phone: draft.phone 
        });
        
      } catch (error) {
        // Mark as failed
        draft.status = 'failed';
        draft.failureReason = error.message;
        await draft.save();
        
        results.push({ 
          draftId: draft._id, 
          status: 'failed', 
          error: error.message,
          phone: draft.phone 
        });
      }
    }
    
    const sentCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    
    res.status(200).json({
      success: true,
      message: `${sentCount} message(s) sent successfully, ${failedCount} failed`,
      sent: sentCount,
      failed: failedCount,
      data: { results }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete draft messages
// @route   DELETE /api/messages/drafts
// @access  Private/Admin
exports.deleteDrafts = async (req, res, next) => {
  try {
    const { draftIds } = req.body;
    
    if (!draftIds || draftIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Draft IDs are required'
      });
    }
    
    const result = await MessageDraft.deleteMany({
      _id: { $in: draftIds },
      branchId: req.user.branchId,
      status: 'draft' // Only allow deleting unsent drafts
    });
    
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} draft(s) deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get message logs/history
// @route   GET /api/messages/logs
// @access  Private
exports.getMessageLogs = async (req, res, next) => {
  try {
    const { 
      memberId, 
      type,
      channel,
      startDate, 
      endDate, 
      page = 1, 
      limit = 50 
    } = req.query;
    
    const query = { branchId: req.user.branchId };
    
    if (memberId) query.memberId = memberId;
    if (type) query.type = type;
    if (channel) query.channel = channel;
    
    if (startDate || endDate) {
      query.sentAt = {};
      if (startDate) query.sentAt.$gte = new Date(startDate);
      if (endDate) query.sentAt.$lte = new Date(endDate);
    }
    
    const logs = await MessageLog.find(query)
      .populate('memberId', 'name phone memberId')
      .populate('sentBy', 'name')
      .sort({ sentAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await MessageLog.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: logs.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: { logs }
    });
  } catch (error) {
    next(error);
  }
};
