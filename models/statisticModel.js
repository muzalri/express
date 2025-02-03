const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Statistic = sequelize.define('Statistic', {
  totalSuccessfulDonations: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalDonationAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  totalRegisteredUsers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  activeCampaigns: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Statistic; 