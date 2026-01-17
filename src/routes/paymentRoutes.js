const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateObjectId, validatePagination, validateDateRange } = require('../middleware/validator');
const paymentController = require('../controllers/paymentController');

// All routes require authentication
router.use(protect);

// Get payment statistics - Both admin and trainer can view
router.get('/stats', validateDateRange, paymentController.getPaymentStats);

// Get all payments - Both admin and trainer can view
router.get('/', validatePagination, validateDateRange, paymentController.getPayments);

// Get single payment - Both admin and trainer can view
router.get('/:id', validateObjectId('id'), paymentController.getPayment);

// Create payment - Admin only
router.post('/', authorize('admin'), paymentController.createPayment);

module.exports = router;
