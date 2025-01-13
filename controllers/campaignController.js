const Campaign = require('../models/campaignModel');

// Membuat campaign baru (admin only)
const createCampaign = async (req, res) => {
  const { title, image, detail, startDate, endDate, target } = req.body;

  try {
    const campaign = await Campaign.create({
      title,
      image,
      detail,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      target,
      createdBy: req.user._id
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
    const campaigns = await Campaign.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update campaign (admin only)
const updateCampaign = async (req, res) => {
  const { id } = req.params;
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      id,
      req.body,
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

module.exports = {
  createCampaign,
  getAllCampaigns,
  updateCampaign,
  deleteCampaign
};