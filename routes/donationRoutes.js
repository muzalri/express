const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  createDonation, 
  getDonationHistory,
  handlePaymentNotification 
} = require('../controllers/donationController');

router.post('/donate', protect, createDonation);
router.get('/donations/history', protect, getDonationHistory);
router.post('/donations/notification', handlePaymentNotification);

module.exports = router;
