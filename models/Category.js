const { Model, DataTypes } = require('sequelize');

const sequelize = require('../config/connection.js');

class Category extends Model {}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull:false
    },
    category_name: {
      type: DataTypes.STRING,
      allowNull:false
    },
  },  
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'category',
  }
);


// models/Category.js
const Product = require('./Product');

Category.hasMany(Product, {
  foreignKey: 'category_id',
});

module.exports = Category;
