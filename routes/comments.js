'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Comment = require('../models/comment');

router.post(
  '/:roomId/users/:userId/comments',
  authenticationEnsurer,
  async (req, res, next) => {
    const roomId = req.params.roomId;
    const userId = req.params.userId;
    const comment = req.body.comment;

    await Comment.upsert({
      roomId: roomId,
      userId: userId,
      comment: comment.slice(0, 255)
    });
    res.json({ status: 'OK', comment: comment });
  }
);

module.exports = router;