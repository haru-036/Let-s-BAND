'use strict';
const {sequelize, DataTypes} = require('./sequelize-loader');

const Room = sequelize.define(
  'rooms',
  {
    roomId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    roomName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    BPM: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    memo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.DECIMAL,
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
        fields: ['createdBy']
      }
    ]
  }
);

module.exports = Room;