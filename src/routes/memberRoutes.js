const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateObjectId, validatePagination } = require('../middleware/validator');
const memberController = require('../controllers/memberController');

// All routes require authentication
router.use(protect);

// Get members expiring soon - Both can view
router.get('/expiring-soon', memberController.getExpiringSoon);

// Get all members with pagination - Both can view
router.get('/', validatePagination, memberController.getMembers);

// Get single member - Both can view
router.get('/:id', validateObjectId('id'), memberController.getMember);

// Create member - Admin only
router.post('/', authorize('admin'), memberController.createMember);

// Update member - Admin only
router.put('/:id', authorize('admin'), validateObjectId('id'), memberController.updateMember);

// Delete member - Admin only
router.delete('/:id', authorize('admin'), validateObjectId('id'), memberController.deleteMember);

module.exports = router;
