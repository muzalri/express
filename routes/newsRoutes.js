const express = require('express');
const router = express.Router();
const { 
  createNews, 
  getNewsByDate, 
  updateNews, 
  deleteNews 
} = require('../controllers/newsController');

router.post('/news', createNews);
router.get('/news', getNewsByDate);
router.put('/news/:id', updateNews);
router.delete('/news/:id', deleteNews);

module.exports = router;