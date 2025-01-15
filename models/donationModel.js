const mongoose = require('mongoose');

const donationSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'expired'],
    default: "pending",
  },
  paymentToken: String,
  redirectUrl: String,
  transactionId: String,
  orderId: String
}, {
  timestamps: true,
});

module.exports = mongoose.model('Donation', donationSchema);
