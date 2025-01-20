const mongoose = require('mongoose');

const campaignSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
    required: true,
  }],
  detail: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['bencana_alam', 'pendidikan', 'kesehatan', 'kemanusiaan', 'lingkungan', 'lainnya']
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  target: {
    type: Number,
    required: true,
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Campaign', campaignSchema);