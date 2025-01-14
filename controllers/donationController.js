const Donation = require('../models/donationModel');
const Campaign = require('../models/campaignModel');
const midtransClient = require('midtrans-client');
require('dotenv').config(); // Pastikan environment variables terload

// Inisialisasi Midtrans
const snap = new midtransClient.Snap({
  isProduction: false, // Gunakan sandbox environment
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// Debug: Log serverKey dan clientKey
console.log('Server Key:', process.env.MIDTRANS_SERVER_KEY);
console.log('Client Key:', process.env.MIDTRANS_CLIENT_KEY);

// Membuat Donasi Baru
const createDonation = async (req, res) => {
  const { campaignId, amount } = req.body;
  const userId = req.user._id;

  // Validasi input
  if (!campaignId || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Campaign ID dan amount harus diisi, dan amount harus lebih besar dari 0' });
  }

  try {
    // Cari campaign yang valid
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign tidak ditemukan' });
    }

    // Buat donasi di database
    const donation = await Donation.create({
      userId,
      campaignId,
      amount,
    });

    // Parameter transaksi Midtrans
    const parameter = {
      transaction_details: {
        order_id: `TRX-${Date.now()}-${donation._id}`, // Gabungkan timestamp dan ID donasi untuk order_id yang unik
        gross_amount: parseInt(amount),
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '08123456789', // Default phone number jika tidak ada
      },
    };

    // Debug: Log parameter transaksi
    console.log('Transaction Parameter:', JSON.stringify(parameter, null, 2));

    // Buat transaksi di Midtrans
    const transaction = await snap.createTransaction(parameter);

    // Debug: Log response dari Midtrans
    console.log('Midtrans Response:', JSON.stringify(transaction, null, 2));

    // Update donasi dengan token dan redirect URL dari Midtrans
    donation.paymentToken = transaction.token;
    donation.redirectUrl = transaction.redirect_url;
    await donation.save();

    // Response sukses
    res.status(201).json({
      success: true,
      message: 'Donasi berhasil dibuat',
      donation,
      paymentUrl: transaction.redirect_url,
    });
  } catch (error) {
    console.error('Error details:', error);

    // Handle error dari Midtrans
    if (error.httpStatusCode === 401) {
      return res.status(401).json({ message: 'Autentikasi Midtrans gagal. Periksa server key dan client key.' });
    }

    res.status(500).json({ message: 'Terjadi kesalahan server. Silakan coba lagi.' });
  }
};

// Mendapatkan riwayat donasi user
const getDonationHistory = async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.user._id })
      .populate('campaignId', 'title')
      .sort('-createdAt'); // Urutkan berdasarkan tanggal terbaru

    res.status(200).json(donations);
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server. Silakan coba lagi.' });
  }
};

// Handle Midtrans Notification
const handlePaymentNotification = async (req, res) => {
  try {
    const notification = await snap.transaction.notification(req.body);
    console.log('Notification received:', notification);

    // Extract donation ID from order_id (format: TRX-timestamp-donationId)
    const orderId = notification.order_id;
    const donationId = orderId.split('-')[2]; // Ambil bagian terakhir
    
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    console.log('Looking for donation with ID:', donationId);
    
    // Cari donasi berdasarkan ID yang benar
    const donation = await Donation.findById(donationId);
    if (!donation) {
      console.log('Donation not found for ID:', donationId);
      return res.status(404).json({ message: 'Donasi tidak ditemukan' });
    }

    console.log('Found donation:', donation);

    // Update status donasi dan campaign amount
    if (transactionStatus === 'settlement' || 
       (transactionStatus === 'capture' && fraudStatus === 'accept')) {
      
      donation.paymentStatus = 'success';
      
      // Update campaign amount
      const campaign = await Campaign.findById(donation.campaignId);
      if (campaign) {
        campaign.currentAmount += donation.amount;
        await campaign.save();
        console.log('Campaign amount updated:', campaign.currentAmount);
      }
    } else if (transactionStatus === 'pending') {
      donation.paymentStatus = 'pending';
    } else {
      donation.paymentStatus = 'failed';
    }

    await donation.save();
    console.log('Donation status updated:', donation.paymentStatus);

    res.status(200).json({ message: 'Notification processed successfully' });
  } catch (error) {
    console.error('Error processing notification:', error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createDonation,
  getDonationHistory,
  handlePaymentNotification,
};