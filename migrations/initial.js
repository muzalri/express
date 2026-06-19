const { sequelize } = require('../config/db');

// Import all models
require('../models/userModel');
require('../models/campaignModel');
require('../models/donationModel');
require('../models/newsModel');
require('../models/statisticModel');
require('../models/documentationModel');
require('../models/documentModel');

async function migrate() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate(); 