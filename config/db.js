const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER, 
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Sync all models
    await sequelize.sync();
    console.log('All models were synchronized successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
