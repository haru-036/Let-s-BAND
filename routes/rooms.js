'use strict';
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const authenticationEnsurer = require('./authentication-ensurer');
const { v4: uuidv4 } = require('uuid');
const Room = require('../models/room');
const User = require('../models/user');
const Music = require('../models/music');
const Comment = require('../models/comment');

const multer = require('multer');
const updir = path.dirname(__dirname).replace(/\\/g, '/') + "/public/musics";
const upload = multer({dest:updir});

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

router.get('/new', authenticationEnsurer, (req, res, next) => {
  res.render('new', { user: req.user });
});

router.post('/', authenticationEnsurer, async (req, res, next) => {
  const roomId = uuidv4();
  const updatedAt = new Date();
  const room = await Room.create({
    roomId: roomId,
    roomName: req.body.roomName.slice(0, 255) || '(名称未設定)',
    BPM: req.body.bpm,
    memo: req.body.memo,
    createdBy: req.user.id,
    updatedAt: updatedAt
  });
  res.redirect('/rooms/' + room.roomId);
});

router.post('/:roomId/music', authenticationEnsurer, upload.single('musicUrl'), async (req, res, next) => {
  const path = req.file.path.replace(/\\/g, "/");
  // const dest = updir + "/" + req.file.originalname;
  // fs.renameSync(path, dest);
  const updatedAt = new Date();
  const music = await Music.create({
      musicUrl: path,
      part: req.body.part,
      memo: req.body.memo,
      createdBy: req.user.id,
      roomId: req.params.roomId,
      updatedAt: updatedAt
    });
  res.redirect('/rooms/' + req.params.roomId);
});

router.get('/:roomId', authenticationEnsurer, async (req, res, next) => {
  const room = await Room.findOne({
    include:[
      {
        model: User,
        attributes: ['userId', 'username']
      }],
    where: {
      roomId: req.params.roomId
    },
    order: [['updatedAt', 'DESC']]
  });

  if (room) {
    const musics = await Music.findAll({
      include:[
        {
          model: User,
          attributes: ['userId', 'username']
        }],
      where: {
        roomId: room.roomId
      },
      order: [['musicId', 'DESC']]
    });
    musics.forEach((music) => {
      music.formattedUpdatedAt = dayjs(music.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
    });
    //コメント取得
    const comments = await Comment.findAll({
      include:[
        {
          model: User,
          attributes: ['userId', 'username']
        }],
      where: { roomId: room.roomId }
    });
    const commentMap = new Map(); //key:userId,value:comment
    comments.forEach((comment) => {
      commentMap.set(comment.userId, comment.comment);
    });

    res.render('room', {
      user: req.user,
      room: room,
      musics: musics,
      users: [req.user],
      commentMap: commentMap
    });
  }else{
    const err = new Error('指定されたルームは見つかりません');
    err.status = 404;
    next(err);
  }
});

router.get('/:roomId/edit', authenticationEnsurer, async (req, res, next) => {
  const room = await Room.findOne({
    where:{
      roomId: req.params.roomId
    }
  });
  if (isMine(req, room)) { //作成者のみが編集フォームを開ける
    res.render('edit', {
      user: req.user,
      room: room,
    });
  }else{
    const err = new Error('指定されたルームがない、または、ルームする権限がありません');
    err.status = 404;
    next(err);
  }
});

function isMine(req, room) {
  return room && parseInt(room.createdBy) === parseInt(req.user.id);
}

function isMineMusic(req, music) {
  return music && parseInt(music.createdBy) === parseInt(req.user.id);
}

router.post('/:roomId', authenticationEnsurer, async (req, res, next) => {
  let room = await Room.findOne({
    where: {
      roomId: req.params.roomId
    }
  });
  if (room && isMine(req, room)) {
    if (parseInt(req.query.edit) === 1) {
      const updatedAt = new Date();
      room = await room.update({
        roomId: room.roomId,
        roomName: req.body.roomName.slice(0, 255) || '(名称未設定)',
        BPM: req.body.bpm,
        memo: req.body.memo,
        createdBy: req.user.id,
        updatedAt: updatedAt
      });
      res.redirect('/rooms/' + room.roomId);
    }else if (parseInt(req.query.delete) === 1) {
      await deleteRoomAggregate(req.params.roomId);
      res.redirect('/');
    }else{
      const err = new Error('不正なリクエストです');
      err.status = 400;
      next(err);
    }
  }else{
    const err = new Error('指定されたルームがない、または、編集する権限がありません');
    err.status = 404;
    next(err);
  }
});

router.post('/:roomId/music/:musicId', authenticationEnsurer, async (req, res, next) => {
  let music = await Music.findOne({
    where: {
      roomId: req.params.roomId,
      musicId: req.params.musicId
    }
  });
  if (music && isMineMusic(req, music)) {
    if (parseInt(req.query.delete) === 1) {
      await music.destroy();
      res.redirect('/rooms/' + music.roomId);
    }else{
      const err = new Error('不正なリクエストです');
      err.status = 400;
      next(err);
    }
  }else{
    const err = new Error('指定された投稿がない、または、編集する権限がありません');
    err.status = 404;
    next(err);
  }
});

async function deleteRoomAggregate(roomId) {
  const comments = await Comment.findAll({
    where: { roomId: roomId }
  });
  const promisesCommentDestroy = comments.map((c) => {return c.destroy();});
  await Promise.all(promisesCommentDestroy);

  const musics = await Music.findAll({
    where: { roomId: roomId }
  });
  const promisesMusicDestroy = musics.map((m) => {return m.destroy();});
  await Promise.all(promisesMusicDestroy);

  const r = await Room.findByPk(roomId);
  await r.destroy();
}

router.deleteRoomAggregate = deleteRoomAggregate;

module.exports = router;