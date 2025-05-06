const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  uploadDocument,
  getAllDocuments,
  downloadDocument
} = require('../controllers/documentController');

// Public routes
router.get('/', getAllDocuments);
router.get('/download/:id', downloadDocument);

// Admin only route - using multer middleware
router.post('/upload', protect, isAdmin, upload.single('pdf'), uploadDocument);

module.exports = router;