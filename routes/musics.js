'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Room = require('../models/room');
const Music = require('../models/music');
const User = require('../models/user');

// router.get(`/rooms/:roomId/musics/new`, authenticationEnsurer, async (req, res, next) => {
//   res.render('new-music', {user: req.user, roomId: req.params.roomId});
// });

router.post(`/`, authenticationEnsurer, async (req, res, next) => {
  const roomId = req.params.roomId;
  const musics = await Music.create({
    musicUrl: req.body.musicUrl,
    part: req.body.part,
    memo: req.body.memo,
    userId: req.user.id,
    roomId: roomId
  });
  res.redirect('/');
});

module.exports = router;