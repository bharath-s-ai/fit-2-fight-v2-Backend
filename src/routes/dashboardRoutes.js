const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

// All routes require authentication
router.use(protect);

// Get dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// Get revenue chart data
router.get('/revenue-chart', dashboardController.getRevenueChart);

// Get attendance chart data
router.get('/attendance-chart', dashboardController.getAttendanceChart);

// Get membership distribution
router.get('/membership-distribution', dashboardController.getMembershipDistribution);

module.exports = router;
