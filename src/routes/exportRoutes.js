const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validateDateRange } = require('../middleware/validator');
const exportController = require('../controllers/exportController');

// All routes require authentication
router.use(protect);

// Export members to CSV
router.get('/members', exportController.exportMembers);

// Export payments to CSV
router.get('/payments', validateDateRange, exportController.exportPayments);

// Export attendance to CSV
router.get('/attendance', validateDateRange, exportController.exportAttendance);

module.exports = router;
