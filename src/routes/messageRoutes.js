const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateObjectId, validatePagination, validateDateRange } = require('../middleware/validator');
const messageController = require('../controllers/messageController');

// All routes require authentication
router.use(protect);

// Generate drafts - Admin only
router.post('/drafts/generate', authorize('admin'), messageController.generateDrafts);

// Get all drafts - Admin & Trainer can view
router.get('/drafts', validatePagination, messageController.getDrafts);

// Get single draft - Admin & Trainer can view
router.get('/drafts/:id', validateObjectId('id'), messageController.getDraft);

// Update draft - Admin only
router.put('/drafts/:id', authorize('admin'), validateObjectId('id'), messageController.updateDraft);

// Send messages - Admin only
router.post('/send', authorize('admin'), messageController.sendMessages);

// Delete drafts - Admin only
router.delete('/drafts', authorize('admin'), messageController.deleteDrafts);

// Get message logs - Admin & Trainer can view
router.get('/logs', validatePagination, validateDateRange, messageController.getMessageLogs);

module.exports = router;
