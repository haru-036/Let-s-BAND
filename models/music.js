'use strict';
const {sequelize, DataTypes} = require('./sequelize-loader');

const Music = sequelize.define(
  'musics',
  {
    musicId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    musicUrl: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    part: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roomId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    memo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['roomId']
      }
    ]
  }
);

module.exports = Music;