const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const {
  createCampaign,
  getAllCampaigns,
  getCampaignsByCategory,
  updateCampaign,
  deleteCampaign,
  getAllCampaignStatistics
} = require('../controllers/campaignController');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/campaigns', getAllCampaigns);
router.get('/campaigns/category/:category', getCampaignsByCategory);
router.get('/campaigns/statistics', protect, getAllCampaignStatistics);

// Protected routes (Admin only)
router.route('/campaigns')
  .post(protect, isAdmin, upload.array('images', 5), createCampaign);

router.route('/campaigns/:id')
  .put(protect, isAdmin, upload.array('images', 5), updateCampaign)
  .delete(protect, isAdmin, deleteCampaign);

module.exports = router;