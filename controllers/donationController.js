const Donation = require('../models/donationModel');
const midtransClient = require('midtrans-client');

// Membuat Donasi Baru
const createDonation = async (req, res) => {
  const { name, email, amount } = req.body;

  try {
    const donation = await Donation.create({ name, email, amount });

    let snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    let parameter = {
      transaction_details: {
        order_id: donation._id.toString(),
        gross_amount: amount,
      },
      customer_details: {
        first_name: name,
        email: email,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    res.status(201).json({
      success: true,
      message: "Donation created successfully",
      donation,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Riwayat Donasi
const getDonationHistory = async (req, res) => {
  try {
    const donations = await Donation.find({ email: req.user.email });
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ekspor fungsi
module.exports = { createDonation, getDonationHistory };
