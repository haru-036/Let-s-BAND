'use strict';
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
dotenv.config();

//モデルの読み込み
const User = require('./models/user');
const Room = require('./models/room');
const Music = require('./models/music');
const Comment = require('./models/comment');
User.sync().then(async () => {
  Room.belongsTo(User, {foreignKey: 'createdBy'});
  Room.sync();
  Comment.belongsTo(User, {foreignKey: 'userId'});
  Comment.sync();
  Music.belongsTo(User, {foreignKey: 'createdBy'});
  Music.belongsTo(Room, {foreignKey: 'roomId'});
  Music.sync();
});

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "491175564633-8oo5ksrorn2622tondpsulmjrh2hpju9.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "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";

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL || "http://localhost:8000/auth/google/callback",
},
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(async function () {
      await User.upsert({
        userId: profile.id,
        username: profile.displayName
      });
      return done(null, profile);
    });
  }
));

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const roomsRouter = require('./routes/rooms');
const musicsRouter = require('./routes/musics');
const commentRouter = require('./routes/comments');

const app = express();
app.use(helmet());
app.use('/app/public', express.static('public'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({secret: '4f26a2d006d9c9c2', resave:false,  saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/rooms', roomsRouter);
app.use('/musics', musicsRouter);
app.use('/rooms', commentRouter);


app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
  function (req, res) {
});

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    const loginFrom = req.cookies.loginFrom;
    //オープンリダイレクタ脆弱性対策
    if (loginFrom && loginFrom.startsWith('/')) {
      res.clearCookie('loginFrom');
      res.redirect(loginFrom);
      }else{
      res.redirect('/');
      }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
