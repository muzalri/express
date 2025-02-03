const { Op } = require('sequelize');
const News = require('../models/newsModel');

// Membuat berita baru
const createNews = async (req, res) => {
  const { title, content, publishDate } = req.body;

  try {
    const news = await News.create({
      title,
      content,
      publishDate: new Date(publishDate)
    });

    res.status(201).json({
      success: true,
      message: "Berita berhasil dibuat",
      news
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mendapatkan semua berita berdasarkan tanggal
const getNewsByDate = async (req, res) => {
  const { date } = req.query;
  
  try {
    let where = { isActive: true };
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      where.publishDate = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    const news = await News.findAll({
      where,
      order: [['publishDate', 'DESC']]
    });
    
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update berita
const updateNews = async (req, res) => {
  const { id } = req.params;
  const { title, content, publishDate } = req.body;

  try {
    const [updated] = await News.update({
      title,
      content,
      publishDate: new Date(publishDate)
    }, {
      where: { id }
    });

    if (!updated) {
      return res.status(404).json({ message: 'Berita tidak ditemukan' });
    }

    const updatedNews = await News.findByPk(id);
    res.json(updatedNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hapus berita (soft delete)
const deleteNews = async (req, res) => {
  const { id } = req.params;

  try {
    const news = await News.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!news) {
      return res.status(404).json({ message: 'Berita tidak ditemukan' });
    }

    res.json({ message: 'Berita berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNews,
  getNewsByDate,
  updateNews,
  deleteNews
};