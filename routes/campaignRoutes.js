const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const {
  createCampaign,
  getAllCampaigns,
  getCampaignsByCategory,
  updateCampaign,
  deleteCampaign
} = require('../controllers/campaignController');
const upload = require('../middleware/uploadMiddleware');

router.post('/campaigns', protect, isAdmin, upload.array('images', 5), createCampaign);
router.get('/campaigns', getAllCampaigns);
router.get('/campaigns/category/:category', getCampaignsByCategory);
router.put('/campaigns/:id', protect, isAdmin, upload.array('images', 5), updateCampaign);
router.delete('/campaigns/:id', protect, isAdmin, deleteCampaign);

module.exports = router;