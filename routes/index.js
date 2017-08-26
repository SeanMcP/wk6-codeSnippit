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
    res.redirect('/profile')
  } else {
    next()
  }
}

router.get('/', login, function(req, res) {
  res.render('login', {
    messages: res.locals.getMessages()
  })
})

router.post('/copy', function(req, res) {
  Snippit.create({
    author: req.user.username,
    title: req.body.title,
    code: req.body.code,
    note: req.body.note,
    language: req.body.language.replace(/\s+/g, '').toLowerCase().split(','),
    tag: req.body.tag.replace(/\s+/g, '').toLowerCase().split(','),
    public: Boolean(req.body.public)
  })
  .then(function(data) {
    res.redirect('/profile')
  })
  .catch(function(err) {
    console.log('YOU ARE GETTING AN ERROR!!!!!\n', err)
    res.send(err)
  })
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
    language: req.body.language.replace(/\s+/g, '').toLowerCase().split(','),
    tag: req.body.tag.replace(/\s+/g, '').toLowerCase().split(','),
    public: Boolean(req.body.public)
  })
  .then(function(data) {
    res.redirect('/profile')
  })
  .catch(function(err) {
    console.log('YOU ARE GETTING AN ERROR!!!!!\n', err)
    res.redirect('/')
  })
})

router.get('/delete/:id', function(req, res) {
  Snippit.findOne({_id: req.params.id}).remove().exec()
  res.redirect('/profile')
})

router.post('/edit/:id', function(req, res) {
  Snippit.update({'_id': req.params.id}, {
    title: req.body.title,
    code: req.body.code,
    note: req.body.note,
    language: req.body.language.replace(/\s+/g, '').toLowerCase().split(',').filter(n => n),
    tag: req.body.tag.replace(/\s+/g, '').toLowerCase().split(',').filter(n => n),
    public: Boolean(req.body.public)
  })
  .then(function(data) {
    console.log('.create data:\n', data)
    res.redirect('/profile')
  })
  .catch(function(err) {
    res.send(err)
  })
})

router.get('/language/:language', function(req, res) {
  Snippit.find({'language': {$in: [req.params.language]}})
  .then(function(data) {
    res.render('profile', {username: req.user.username, data: data})
  })
  .catch(function(err) {
    res.send(err)
  })
})

router.get('/login', function(req, res) {
  res.redirect('/')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/',
  failureFlash: true
}))

router.get('/logout', function(req, res) {
  req.logout()
  res.redirect('/')
})

router.get('/profile', requireLogin, function(req, res) {
  Snippit.find({'author': req.user.username})
  .then(function(data) {
    res.render('profile', {username: req.user.username, data: data})
  })
  .catch(function(err) {
    console.log('THERE IS AN ERROR!!!!!!\n', err);
    res.redirect('/user')
  })
})

router.get('/public', requireLogin, function(req, res) {
  Snippit.find({'public': true})
  .then(function(data) {
    res.render('public', {data: data})
  })
  .catch(function(err) {
    console.log('THERE IS AN ERROR!!!!!!\n', err);
    res.send(err)
  })
})

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

router.get('/tag/:tag', function(req, res) {
  Snippit.find({'tag': {$in: [req.params.tag]}})
  .then(function(data) {
    res.render('profile', {username: req.user.username, data: data})
  })
  .catch(function(err) {
    res.send(err)
  })
})

router.get('/user/:author', requireLogin, function(req, res) {
  Snippit.find({'author': req.params.author})
  .then(function(data) {
    if (req.params.author == req.user.username) {
      res.render('profile', {username: req.params.author, data: data})
    } else {
      res.render('user', {username: req.params.author, data: data})
    }
  })
  .catch(function(err) {
    console.log('THERE IS AN ERROR!!!!!!\n', err);
    res.send(err)
  })
})

router.get('/view/:id', function(req, res) {
    Snippit.find({'_id': req.params.id})
    .then(function(data) {
      if (data[0].author == req.user.username) {
        res.render('edit', {data: data})
      } else {
        res.render('view', {data: data})
      }
    })
    .catch(function(err) {
      res.send(err)
    })
})
module.exports = router
