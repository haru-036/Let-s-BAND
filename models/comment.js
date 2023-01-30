'use strict';
const {sequelize, DataTypes} = require('./sequelize-loader');

const Comment = sequelize.define(
  'comments',
  {
    roomId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.DECIMAL,
      primaryKey: true,
      allowNull: false
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timestamps: false
  }
);

module.exports = Comment;