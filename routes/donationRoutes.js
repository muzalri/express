const express = require('express');
const router = express.Router();
const { createDonation, getDonationHistory } = require('../controllers/donationController');

// Rute untuk membuat donasi
router.post('/donate', createDonation);

// Rute untuk mendapatkan riwayat donasi
router.get('/donations', getDonationHistory);

module.exports = router;
