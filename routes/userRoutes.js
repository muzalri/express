const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const {
  getAllUsers,
  getUser,
  updateUser,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');

// Public routes
router.get('/users', protect, isAdmin, getAllUsers);
router.get('/users/:id', protect, getUser);

// Protected routes
router.put('/users/:id', protect, updateUser);
router.put('/users/:id/role', protect, isAdmin, updateUserRole);
router.delete('/users/:id', protect, isAdmin, deleteUser);

module.exports = router; 