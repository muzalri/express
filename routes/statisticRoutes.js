const express = require('express');
const router = express.Router();
const { getStatistics } = require('../controllers/statisticController');

// Endpoint untuk mendapatkan statistik (public)
router.get('/statistics', getStatistics);

module.exports = router; 