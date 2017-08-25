const express = require('express')
const User = require('../models/user')
const Snippit = require('../models/snippit')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')

const requireLogin = function (req, res, next) {
  if (req.user) {
    console.log(req.user)
    next()
  } else {
    res.redirect('/')
  }
}

const login = function (req, res, next) {
  if (req.user) {
    res.redirect('/user')
  } else {
    next()
  }
}

router.get('/', login, function(req, res) {
  res.render('login', {
    messages: res.locals.getMessages()
  })
})

router.get('/login', function(req, res) {
  res.redirect('/')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/user',
  failureRedirect: '/',
  failureFlash: true
}))

router.get('/signup', function(req, res) {
  res.render('signup')
})

router.post('/signup', function(req, res) {
  User.create({
    username: req.body.username,
    password: req.body.password
  })
  .then(function(data) {
    console.log(data)
    res.redirect('/')
  })
  .catch(function(err) {
    console.log(err)
    res.redirect('/signup')
  })
})

router.get('/user', requireLogin, function(req, res) {
  // let name = req.user.username
  Snippit.find({'author': req.user.username})
  .then(function(data) {
    res.render('user', {username: req.user.username, data: data})
  })
  .catch(function(err) {
    console.log('THERE IS AN ERROR!!!!!!\n', err);
    res.redirect('/user')
  })
  // res.render('user', {username: req.user.username})
})

router.get('/logout', function(req, res) {
  req.logout()
  res.redirect('/')
})

router.get('/create', function(req, res) {
  res.render('create', {username: req.user.username})
})

router.post('/create', function(req, res) {

  Snippit.create({
    author: req.user.username,
    title: req.body.title,
    code: req.body.code,
    note: req.body.note,
    language: req.body.language,
    tag: [req.body.tag],
    public: Boolean(req.body.public)
  })
  .then(function(data) {
    console.log('.create data:\n', data)
    res.redirect('/user')
  })
  .catch(function(err) {
    console.log('YOU ARE GETTING AN ERROR!!!!!\n', err)
    res.redirect('/')
  })
})

router.get('/view/:id', function(req, res) {
  if (req.params.id === 'main.css') {
    res.render('view', {data: req.session.data});
  } else {
    req.session.data = null;
    Snippit.find({'_id': req.params.id})
    .then(function(data) {
      req.session.data = data;
      res.render('view', {data: data})
    })
    .catch(function(err) {
      console.log('YOU ARE GETTING AN ERROR: ', err);
    })
  }
})

module.exports = router
