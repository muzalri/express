const Campaign = require('../models/campaignModel');
const User = require('../models/userModel');
const Donation = require('../models/donationModel');

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
      campaign,
      userRole: req.user.role
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      userRole: req.user.role
    });
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
    
    res.status(200).json({
      success: true,
      campaigns,
      userRole: req.user?.role || 'public'
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      userRole: req.user?.role || 'public'
    });
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

    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({ 
        message: 'Campaign tidak ditemukan',
        userRole: req.user.role
      });
    }

    await campaign.update(updateData);

    res.json({
      success: true,
      message: 'Campaign berhasil diperbarui',
      campaign,
      userRole: req.user.role
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      userRole: req.user.role
    });
  }
};

// Hapus campaign (admin only)
const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({ 
        success: false,
        message: 'Campaign tidak ditemukan'
      });
    }

    // Hapus campaign
    await campaign.destroy();

    res.status(200).json({
      success: true,
      message: 'Campaign berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ 
      success: false,
      message: 'Gagal menghapus campaign',
      error: error.message
    });
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
    res.status(200).json({
      success: true,
      campaigns,
      userRole: req.user.role
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      userRole: req.user.role
    });
  }
};

const getCampaignStatistics = async (req, res) => {
  try {
    const { id } = req.params;

    // Dapatkan data campaign
    const campaign = await Campaign.findByPk(id, {
      attributes: ['id', 'title', 'target', 'currentAmount', 'startDate', 'endDate']
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign tidak ditemukan' });
    }

    // Dapatkan semua donasi untuk campaign ini
    const donations = await Donation.findAll({
      where: { 
        campaignId: id,
        paymentStatus: 'success'
      },
      include: [{
        model: User,
        attributes: ['name', 'email']
      }],
      order: [['createdAt', 'ASC']]
    });

    // Hitung statistik per hari
    const dailyStats = {};
    donations.forEach(donation => {
      const date = donation.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          totalAmount: 0,
          donationCount: 0,
          donations: []
        };
      }
      dailyStats[date].totalAmount += donation.amount;
      dailyStats[date].donationCount++;
      dailyStats[date].donations.push({
        amount: donation.amount,
        donorName: donation.User.name,
        donorEmail: donation.User.email,
        date: donation.createdAt
      });
    });

    // Konversi ke array dan urutkan berdasarkan tanggal
    const dailyStatsArray = Object.values(dailyStats).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Hitung total statistik
    const totalStats = {
      totalDonations: donations.length,
      totalAmount: donations.reduce((sum, donation) => sum + donation.amount, 0),
      averageDonation: donations.length > 0 
        ? donations.reduce((sum, donation) => sum + donation.amount, 0) / donations.length 
        : 0,
      progress: (campaign.currentAmount / campaign.target) * 100
    };

    res.status(200).json({
      campaign: {
        id: campaign.id,
        title: campaign.title,
        target: campaign.target,
        currentAmount: campaign.currentAmount,
        startDate: campaign.startDate,
        endDate: campaign.endDate
      },
      statistics: {
        daily: dailyStatsArray,
        total: totalStats
      }
    });
  } catch (error) {
    console.error('Error getting campaign statistics:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

const getAllCampaignStatistics = async (req, res) => {
  try {
    // Dapatkan semua campaign
    const campaigns = await Campaign.findAll({
      attributes: ['id', 'title', 'target', 'currentAmount', 'startDate', 'endDate', 'category']
    });

    // Dapatkan statistik untuk setiap campaign
    const campaignStats = await Promise.all(campaigns.map(async (campaign) => {
      const donations = await Donation.findAll({
        where: { 
          campaignId: campaign.id,
          paymentStatus: 'success'
        },
        include: [{
          model: User,
          attributes: ['name', 'email']
        }],
        order: [['createdAt', 'ASC']]
      });

      // Hitung statistik per hari
      const dailyStats = {};
      donations.forEach(donation => {
        const date = donation.createdAt.toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = {
            date,
            totalAmount: 0,
            donationCount: 0,
            donations: []
          };
        }
        dailyStats[date].totalAmount += donation.amount;
        dailyStats[date].donationCount++;
        dailyStats[date].donations.push({
          amount: donation.amount,
          donorName: donation.User.name,
          donorEmail: donation.User.email,
          date: donation.createdAt
        });
      });

      // Konversi ke array dan urutkan berdasarkan tanggal
      const dailyStatsArray = Object.values(dailyStats).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );

      // Hitung total statistik
      const totalStats = {
        totalDonations: donations.length,
        totalAmount: donations.reduce((sum, donation) => sum + donation.amount, 0),
        averageDonation: donations.length > 0 
          ? donations.reduce((sum, donation) => sum + donation.amount, 0) / donations.length 
          : 0,
        progress: (campaign.currentAmount / campaign.target) * 100
      };

      return {
        campaign: {
          id: campaign.id,
          title: campaign.title,
          target: campaign.target,
          currentAmount: campaign.currentAmount,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          category: campaign.category
        },
        statistics: {
          daily: dailyStatsArray,
          total: totalStats
        }
      };
    }));

    // Urutkan berdasarkan total donasi (descending)
    campaignStats.sort((a, b) => b.statistics.total.totalAmount - a.statistics.total.totalAmount);

    res.status(200).json(campaignStats);
  } catch (error) {
    console.error('Error getting all campaign statistics:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = {
  createCampaign,
  getAllCampaigns,
  updateCampaign,
  deleteCampaign,
  getCampaignsByCategory,
  getCampaignStatistics,
  getAllCampaignStatistics
};