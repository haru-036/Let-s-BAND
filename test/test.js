'use strict';
const request = require('supertest');
const app = require('../app');
const passportStub = require('passport-stub');
const User = require('../models/user');
const Room = require('../models/room');
const Music = require('../models/music');
const deleteRoomAggregate = require('../routes/rooms').deleteRoomAggregate;

describe('/login', () => {
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({displayName: 'testuser'});
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall();
  });

  test('ログインのためのリンクが含まれる', async () => {
    await request(app)
      .get('/login')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/<a class="btn btn-info my-3" href="\/auth\/google"/)
      .expect(200);
  });

  test('ログイン時はユーザ名が表示される', async () => {
    await request(app)
      .get('/login')
      .expect(/testuser/)
      .expect(200)
  });
});  

describe('/logout', () => {
  test('/ にリダイレクトされる', async () => {
    await request(app)
      .get('/logout')
      .expect('Location', '/')
      .expect(302);
  });
});

describe('/rooms', () => {
  let roomId = '';
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({id: 0, username: 'testuser'});
  });

  afterAll(async () => {
    passportStub.logout();
    passportStub.uninstall();

    await deleteRoomAggregate(roomId);
  });

  test('ルームが作成でき、表示される', async () => {
    await User.upsert({ userId: 0, username: 'testuser' });
    const res = await request(app)
      .post('/rooms')
      .send({
        roomName: 'テストルーム1',
        bpm: '110',
        memo: 'テストメモ1\r\nテストメモ2'
      })
      .expect('Location', /rooms/)
      .expect(302)
    
    const createdRoomPath = res.headers.location;
    roomId = createdRoomPath.split('/rooms/')[1];
    await request(app)
      .get(createdRoomPath)
      .expect(/テストルーム1/)
      .expect(/110/)
      .expect(/テストメモ1/)
      .expect(/テストメモ2/)
      
      .expect(200)
  });
});


describe('/rooms/:roomId?edit=1', () => {
  let roomId = '';
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id:0, username: 'testuser'});
  });

  afterAll(async () => {
    passportStub.logout();
    passportStub.uninstall();
    await deleteRoomAggregate(roomId);
  });

  test('ルームが更新できる', async () => {
    await User.upsert({ userId: 0, username: 'testuser' });
    const res = await request(app)
      .post('/rooms')
      .send({ roomName: 'テスト更新ルーム1', bpm: '100', memo: 'テスト更新メモ1' })
    const createdRoomPath = res.headers.location;
    roomId = createdRoomPath.split('/rooms/')[1];
    //更新がされることをテスト
    await request(app)
      .post(`/rooms/${roomId}?edit=1`)
      .send({ roomName: 'テスト更新ルーム2', bpm: '110', memo: 'テスト更新メモ2' })
    const s = await Room.findByPk(roomId);
    expect(s.roomName).toBe('テスト更新ルーム2');
    expect(s.BPM).toBe(110);
    expect(s.memo).toBe('テスト更新メモ2');
  });
});

describe('/rooms/:roomId?delete=1', () => {
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall();
  });

  test('ルームに関連する全ての情報が削除できる', async () => {
    await User.upsert({ userId: 0, username: 'testuser' });
    const res = await request(app)
      .post('/rooms')
      .send({ roomName: 'テスト削除ルーム1', bpm: '100', memo: 'テスト削除メモ1' })
    const createdRoomPath = res.headers.location;
    const roomId = createdRoomPath.split('/rooms/')[1];

    //削除
    await request(app)
      .post(`/rooms/${roomId}?delete=1`);

    //テスト
    const comments = await Comment.findAll({
      where: { roomId: roomId }
    });
    expect(comments.length).toBe(0);

    const musics = await Music.findAll({
      where: { roomId: roomId }
    });
    expect(musics.length).toBe(0);

    const room = await Room.findByPk(roomId);
    expect(!room).toBe(true);
  });
});