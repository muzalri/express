const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true, // Menjadikan nomor telepon sebagai field yang wajib diisi
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);