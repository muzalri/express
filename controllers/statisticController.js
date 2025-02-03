const { sequelize } = require('../config/db');
const Donation = require('../models/donationModel');
const User = require('../models/userModel');
const Campaign = require('../models/campaignModel');
const Statistic = require('../models/statisticModel');

const getStatistics = async (req, res) => {
  try {
    // Hitung donasi sukses
    const successfulDonations = await Donation.findAll({
      where: { paymentStatus: 'success' },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ]
    });
    
    // Hitung total user
    const totalUsers = await User.count();
    
    // Hitung campaign aktif
    const activeCampaigns = await Campaign.count({
      where: { status: 'active' }
    });

    // Update atau buat statistik baru
    const [statistic] = await Statistic.findOrCreate({
      where: { id: 1 },
      defaults: {
        totalSuccessfulDonations: successfulDonations[0].dataValues.total || 0,
        totalDonationAmount: successfulDonations[0].dataValues.totalAmount || 0,
        totalRegisteredUsers: totalUsers,
        activeCampaigns,
        lastUpdated: new Date()
      }
    });

    // Update jika sudah ada
    if (statistic) {
      await statistic.update({
        totalSuccessfulDonations: successfulDonations[0].dataValues.total || 0,
        totalDonationAmount: successfulDonations[0].dataValues.totalAmount || 0,
        totalRegisteredUsers: totalUsers,
        activeCampaigns,
        lastUpdated: new Date()
      });
    }

    res.status(200).json({
      success: true,
      data: statistic
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Gagal mendapatkan statistik'
    });
  }
};

// Fungsi untuk update statistik secara periodik
const updateStatistics = async () => {
  try {
    const successfulDonations = await Donation.findAll({
      where: { paymentStatus: 'success' },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ]
    });
    
    const totalUsers = await User.count();
    const activeCampaigns = await Campaign.count({
      where: { status: 'active' }
    });

    await Statistic.upsert({
      id: 1,
      totalSuccessfulDonations: successfulDonations[0].dataValues.total || 0,
      totalDonationAmount: successfulDonations[0].dataValues.totalAmount || 0,
      totalRegisteredUsers: totalUsers,
      activeCampaigns,
      lastUpdated: new Date()
    });

    console.log('Statistics updated successfully');
  } catch (error) {
    console.error('Error updating statistics:', error);
  }
};

module.exports = { 
  getStatistics,
  updateStatistics
}; 