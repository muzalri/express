const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const {
  uploadDocument,
  getAllDocuments,
  downloadDocument
} = require('../controllers/documentController');

// Public routes (no authentication required)
router.get('/', getAllDocuments);
router.get('/download/:id', downloadDocument);

// Admin only route
router.post('/upload', protect, isAdmin, uploadDocument);

module.exports = router;