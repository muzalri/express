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

router.post('/campaigns', protect, isAdmin, createCampaign);
router.get('/campaigns', getAllCampaigns);
router.get('/campaigns/category/:category', getCampaignsByCategory);
router.put('/campaigns/:id', protect, isAdmin, updateCampaign);
router.delete('/campaigns/:id', protect, isAdmin, deleteCampaign);

module.exports = router;