'use strict';
const {Sequelize, DataTypes} = require('sequelize');
const sequelize = new Sequelize(
  'postgres://postgres:postgres@db/winter-contest'
);

module.exports = {
  sequelize,
  DataTypes
};