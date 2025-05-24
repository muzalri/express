const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./userModel");

const Document = sequelize.define("Document", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filepath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reportDate: {
    type: DataTypes.DATEONLY,
    allowNull: true, // boleh null untuk dokumen lama
  },
});

Document.belongsTo(User, { foreignKey: "uploadedBy", as: "uploader" });

module.exports = Document;
