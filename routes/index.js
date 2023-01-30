'use strict';
const express = require('express');
const router = express.Router();
const Room = require('../models/room');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

/* GET home page. */
router.get('/', async (req, res, next) => {
  const title = "Let's BAND!!";
  if (req.user) {
    const rooms = await Room.findAll({
      where: {
        createdBy: req.user.id
      },
      order: [['updatedAt', 'DESC']]
    });    
    const allrooms = await Room.findAll({
      order: [['updatedAt', 'DESC']]
    });
    rooms.forEach((room) => {
      room.formattedUpdatedAt = dayjs(room.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
    });
    allrooms.forEach((room) => {
      room.formattedUpdatedAt = dayjs(room.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
    });
    res.render('index', {
      title: title,
      user: req.user,
      rooms: rooms,
      allrooms: allrooms
    });
  }else{
    res.render('index', { title: title, user: req.user });
  }
});

module.exports = router;
