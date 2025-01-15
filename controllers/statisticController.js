const Donation = require('../models/donationModel');
const User = require('../models/userModel');
const Campaign = require('../models/campaignModel');

const getStatistics = async (req, res) => {
  try {
    // Hitung total donasi sukses dan jumlahnya
    const successfulDonations = await Donation.find({ paymentStatus: 'success' });
    const totalDonationAmount = successfulDonations.reduce((acc, donation) => acc + donation.amount, 0);
    
    // Hitung total user terdaftar
    const totalUsers = await User.countDocuments();

    // Hitung total campaign aktif
    const activeCampaigns = await Campaign.countDocuments({ status: 'active' });

    const statistics = {
      totalSuccessfulDonations: successfulDonations.length,
      totalDonationAmount,
      totalRegisteredUsers: totalUsers,
      activeCampaigns,
      lastUpdated: new Date()
    };

    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Gagal mendapatkan statistik'
    });
  }
};

module.exports = {
  getStatistics
}; 