const Donation = require('../models/donationModel');
const Campaign = require('../models/campaignModel');
const User = require('../models/userModel');
const midtransClient = require('midtrans-client');
require('dotenv').config(); // Pastikan environment variables terload

// Inisialisasi Midtrans
const snap = new midtransClient.Snap({
  isProduction: true, // Ubah ke production mode
  serverKey: 'Mid-server-u-QrSGLce6hQvXfIUEO15iYu',
  clientKey: 'Mid-client-4U9vA8wZWw9XpX6G',
});

// Debug: Log serverKey dan clientKey
console.log('Server Key:', process.env.MIDTRANS_SERVER_KEY);
console.log('Client Key:', process.env.MIDTRANS_CLIENT_KEY);

// Membuat Donasi Baru
const createDonation = async (req, res) => {
  const { campaignId, amount } = req.body;
  const userId = req.user.id;

  try {
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign tidak ditemukan' });
    }

    const donation = await Donation.create({
      userId,
      campaignId,
      amount,
      paymentStatus: 'pending'
    });

    // Format order_id sesuai dengan format Midtrans
    const orderId = `payment_${donation._id}_${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: parseInt(amount)
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '08123456789'
      }
    };

    const transaction = await snap.createTransaction(parameter);
    
    // Simpan order_id untuk referensi
    donation.orderId = orderId;
    donation.paymentToken = transaction.token;
    donation.redirectUrl = transaction.redirect_url;
    await donation.save();

    res.status(201).json({
      success: true,
      message: 'Donasi berhasil dibuat',
      donation,
      paymentUrl: transaction.redirect_url
    });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ message: error.message });
  }
};

// Mendapatkan riwayat donasi user
const getDonationHistory = async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.user._id })
      .populate({
        path: 'campaignId',
        select: 'title image category'
      })
      .sort('-createdAt');

    // Cek status di Midtrans untuk setiap donasi yang masih pending
    for (let donation of donations) {
      if (donation.paymentStatus === 'pending' && donation.transactionId) {
        try {
          const status = await snap.transaction.status(donation.transactionId);
          
          // Update status berdasarkan response Midtrans
          if (status.transaction_status === 'settlement' || 
             (status.transaction_status === 'capture' && status.fraud_status === 'accept')) {
            donation.paymentStatus = 'success';
            
            // Update campaign amount jika status berubah menjadi success
            const campaign = await Campaign.findById(donation.campaignId);
            if (campaign) {
              campaign.currentAmount += donation.amount;
              await campaign.save();
            }
          } else if (['cancel', 'deny', 'expire'].includes(status.transaction_status)) {
            donation.paymentStatus = 'failed';
          }
          
          await donation.save();
        } catch (error) {
          console.error('Error checking Midtrans status:', error);
        }
      }
    }

    res.status(200).json(donations);
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server. Silakan coba lagi.' });
  }
};

// Handle Midtrans Notification
const handlePaymentNotification = async (req, res) => {
  try {
    console.log('Notification received:', req.body);
    
    const {
      order_id,
      transaction_status,
      fraud_status,
      transaction_id,
      gross_amount
    } = req.body;

    // Extract donation ID dari order_id (format: payment_donationId_timestamp)
    const donationId = order_id.split('_')[1];
    console.log('Extracted donation ID:', donationId);

    const donation = await Donation.findById(donationId);
    if (!donation) {
      console.log('Donation not found for ID:', donationId);
      return res.status(200).json({ message: 'Donasi tidak ditemukan' });
    }

    // Verifikasi jumlah pembayaran
    if (parseInt(gross_amount) !== donation.amount) {
      console.log('Amount mismatch:', { 
        expected: donation.amount, 
        received: gross_amount 
      });
      return res.status(200).json({ message: 'Jumlah pembayaran tidak sesuai' });
    }

    // Update transaction ID
    donation.transactionId = transaction_id;

    // Update payment status
    if (transaction_status === 'settlement') {
      donation.paymentStatus = 'success';
      
      // Update campaign amount
      const campaign = await Campaign.findById(donation.campaignId);
      if (campaign) {
        campaign.currentAmount = (campaign.currentAmount || 0) + donation.amount;
        await campaign.save();
        console.log('Campaign amount updated:', campaign.currentAmount);
      }
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      donation.paymentStatus = 'failed';
    } else {
      donation.paymentStatus = 'pending';
    }

    await donation.save();
    console.log('Donation updated:', {
      id: donation._id,
      status: donation.paymentStatus,
      transactionId: donation.transactionId
    });

    res.status(200).json({ 
      message: 'Notification processed successfully',
      orderId: order_id,
      status: donation.paymentStatus
    });
  } catch (error) {
    console.error('Error processing notification:', error);
    res.status(200).json({ 
      message: 'Error processed',
      error: error.message 
    });
  }
};


module.exports = {
  createDonation,
  getDonationHistory,
  handlePaymentNotification,
};