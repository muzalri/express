const { sequelize } = require('../config/db');

async function migrate() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

migrate(); 