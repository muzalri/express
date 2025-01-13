const mongoose = require('mongoose');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const createDefaultAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const adminExists = await User.findOne({ email: 'admin@admin.com' });
    if (adminExists) {
      console.log('Admin sudah ada');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin', 10);
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      phone: '08123456789',
      role: 'admin'
    });

    console.log('Admin berhasil dibuat:', admin);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createDefaultAdmin(); 