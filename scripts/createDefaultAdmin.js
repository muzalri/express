const { sequelize } = require('../config/db');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const createDefaultAdmin = async () => {
  try {
    await sequelize.authenticate();
    
    const adminExists = await User.findOne({ 
      where: { email: 'admin@admin.com' } 
    });
    
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