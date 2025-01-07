const mongoose = require('mongoose');

const newsSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  publishDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('News', newsSchema);