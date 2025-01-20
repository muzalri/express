const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  createDocumentation,
  getAllDocumentations,
  updateDocumentation,
  deleteDocumentation
} = require('../controllers/documentationController');

router.post('/documentations', protect, isAdmin, upload.array('images', 10), createDocumentation);
router.get('/documentations', getAllDocumentations);
router.put('/documentations/:id', protect, isAdmin, upload.array('images', 10), updateDocumentation);
router.delete('/documentations/:id', protect, isAdmin, deleteDocumentation);

module.exports = router; 