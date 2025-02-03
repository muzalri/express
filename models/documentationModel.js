const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Documentation = sequelize.define('Documentation', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  images: {
    type: DataTypes.JSON,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Documentation; 