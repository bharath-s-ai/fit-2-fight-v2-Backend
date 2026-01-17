const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validateObjectId, validatePagination, validateDateRange } = require('../middleware/validator');
const attendanceController = require('../controllers/attendanceController');

// All routes require authentication
router.use(protect);

// Get today's attendance - Both admin and trainer can view
router.get('/today', attendanceController.getTodayAttendance);

// Get attendance statistics - Both admin and trainer can view
router.get('/stats', attendanceController.getAttendanceStats);

// Get all attendance records - Both admin and trainer can view
router.get('/', validatePagination, validateDateRange, attendanceController.getAttendance);

// Check-in member - Both admin and trainer can check-in
router.post('/checkin', attendanceController.checkIn);

// Check-out member - Both admin and trainer can check-out
router.put('/checkout/:id', validateObjectId('id'), attendanceController.checkOut);

module.exports = router;
