const mongoose = require('mongoose');

const documentationSchema = mongoose.Schema({
  title: {
    type: String,
    required: false, // nullable
  },
  images: [{
    type: String,
    required: true,
  }],
  date: {
    type: Date,
    default: Date.now,
    required: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Documentation', documentationSchema); 