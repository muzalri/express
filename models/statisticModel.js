const mongoose = require('mongoose');

const statisticSchema = mongoose.Schema({
  totalSuccessfulDonations: {
    type: Number,
    default: 0
  },
  totalDonationAmount: {
    type: Number,
    default: 0
  },
  totalRegisteredUsers: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Statistic', statisticSchema); 