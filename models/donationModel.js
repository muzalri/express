const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./userModel');
const Campaign = require('./campaignModel');

const Donation = sequelize.define('Donation', {
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'success', 'failed'),
    defaultValue: 'pending'
  },
  orderId: {
    type: DataTypes.STRING,
    unique: true
  },
  paymentToken: {
    type: DataTypes.STRING
  },
  redirectUrl: {
    type: DataTypes.STRING
  },
  transactionId: {
    type: DataTypes.STRING
  }
});

Donation.belongsTo(User, { foreignKey: 'userId' });
Donation.belongsTo(Campaign, { foreignKey: 'campaignId' });

module.exports = Donation;
