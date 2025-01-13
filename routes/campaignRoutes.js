const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const {
  createCampaign,
  getAllCampaigns,
  updateCampaign,
  deleteCampaign
} = require('../controllers/campaignController');

router.post('/campaigns', protect, isAdmin, createCampaign);
router.get('/campaigns', getAllCampaigns);
router.put('/campaigns/:id', protect, isAdmin, updateCampaign);
router.delete('/campaigns/:id', protect, isAdmin, deleteCampaign);

module.exports = router;