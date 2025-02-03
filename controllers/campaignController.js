const Campaign = require('../models/campaignModel');
const User = require('../models/userModel');

// Membuat campaign baru (admin only)
const createCampaign = async (req, res) => {
  try {
    const { title, detail, category, startDate, endDate, target } = req.body;
    
    // Mengambil path file yang diupload
    const images = req.files.map(file => `/uploads/${file.filename}`);

    if (images.length === 0) {
      return res.status(400).json({ 
        message: "Minimal satu gambar harus diunggah" 
      });
    }

    const campaign = await Campaign.create({
      title,
      images,
      detail,
      category,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      target,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Campaign berhasil dibuat",
      campaign
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mendapatkan semua campaign
const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      include: [{
        model: User,
        as: 'creator',
        attributes: ['name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update campaign (admin only)
const updateCampaign = async (req, res) => {
  const { id } = req.params;
  try {
    let updateData = { ...req.body };
    
    // Jika ada file baru diupload
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const campaign = await Campaign.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign tidak ditemukan' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hapus campaign (admin only)
const deleteCampaign = async (req, res) => {
  const { id } = req.params;
  try {
    const campaign = await Campaign.findByIdAndDelete(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign tidak ditemukan' });
    }
    res.json({ message: 'Campaign berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tambahkan endpoint untuk mendapatkan campaign berdasarkan kategori
const getCampaignsByCategory = async (req, res) => {
  const { category } = req.params;
  
  try {
    const campaigns = await Campaign.findAll({
      where: { category },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCampaign,
  getAllCampaigns,
  updateCampaign,
  deleteCampaign,
  getCampaignsByCategory
};