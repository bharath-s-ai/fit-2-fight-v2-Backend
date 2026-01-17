const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const authController = require('../controllers/authController');

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/updatedetails', protect, authController.updateDetails);
router.put('/updatepassword', protect, authController.updatePassword);

// Admin only routes
router.post('/register', protect, authorize('admin'), authController.register);
router.get('/users', protect, authorize('admin'), authController.getUsers);
router.delete('/users/:id', protect, authorize('admin'), authController.deleteUser);

module.exports = router;
