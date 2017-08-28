const express = require('express')
const User = require('../models/user')
const Snippit = require('../models/snippit')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')

const requireLogin = function (req, res, next) {
  if (req.user) {
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
  res.render('login', {user: req.user, messages: res.locals.getMessages()
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
    res.send(err)
  })
})

router.get('/create', requireLogin, function(req, res) {
  res.render('snippit', {username: req.user.username, create:true})
})

router.post('/create', function(req, res) {
  Snippit.create({
    author: req.user.username,
    title: req.body.title,
    code: req.body.code,
    note: req.body.note,
    language: req.body.language.replace(/\s+/g, '').toLowerCase().split(',').filter(n => n),
    tag: req.body.tag.replace(/\s+/g, '').toLowerCase().split(',').filter(n => n),
    public: Boolean(req.body.public)
  })
  .then(function(data) {
    res.redirect('/profile')
  })
  .catch(function(err) {
    res.redirect('/')
  })
})

router.get('/delete/:id', requireLogin, function(req, res) {
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
    res.redirect('/profile')
  })
  .catch(function(err) {
    res.send(err)
  })
})

router.get('/language/:language', function(req, res) {
  Snippit.find({'language': {$in: [req.params.language]}, 'public': true})
  .then(function(data) {
    res.render('public', {username: req.user.username, data: data})
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
    res.render('user', {user: req.user, username: req.user.username, data: data, profile: true})
  })
  .catch(function(err) {
    res.send('err')
  })
})

router.get('/public', function(req, res) {
  Snippit.find({'public': true})
  .then(function(data) {
    res.render('public', {user: req.user, data: data})
  })
  .catch(function(err) {
    res.send(err)
  })
})

router.get('/signup', function(req, res) {
  res.render('signup', {user: req.user})
})

router.post('/signup', function(req, res) {
  User.create({
    username: req.body.username,
    password: req.body.password
  })
  .then(function(data) {
    res.redirect('/')
  })
  .catch(function(err) {
    res.redirect('/signup')
  })
})

router.get('/tag/:tag', function(req, res) {
  Snippit.find({'tag': {$in: [req.params.tag]}, 'public': true})
  .then(function(data) {
    res.render('public', {username: req.user.username, data: data})
  })
  .catch(function(err) {
    res.send(err)
  })
})

router.get('/user/:author', function(req, res) {
  if (!req.user) {
    Snippit.find({'author': req.params.author, 'public': true})
    .then(function(data) {
      res.render('user', {user: req.user, username: req.params.author, data: data})
    })
    .catch(function(err) {
      res.send(err)
    })
  } else if (req.params.author == req.user.username) {
    Snippit.find({'author': req.params.author})
    .then(function(data) {
      res.render('user', {user: req.user, username: req.params.author, data: data, profile: true})
    })
    .catch(function(err) {
      res.send(err)
    })
  } else {
    Snippit.find({'author': req.params.author, 'public': true})
    .then(function(data) {
      res.render('user', {user: req.user, username: req.params.author, data: data})
    })
    .catch(function(err) {
      res.send(err)
    })
  }
})

router.get('/user/:username/language/:language', function(req, res) {
  if(req.params.username == req.user.username) {
    Snippit.find({'language': {$in: [req.params.language]}, 'author': req.params.username})
    .then(function(data) {
        res.render('user', {username: req.params.username, data: data, profile: true})
    })
    .catch(function(err) {
      res.send(err)
    })
  } else {
    Snippit.find({'language': {$in: [req.params.language]}, 'author': req.params.username, 'public': true})
    .then(function(data) {
        res.render('user', {username: req.params.username, data: data})
    })
    .catch(function(err) {
      res.send(err)
    })
  }
})

router.get('/user/:username/tag/:tag', function(req, res) {
  if(req.params.username == req.user.username) {
    Snippit.find({'tag': {$in: [req.params.tag]}, 'author': req.params.username})
    .then(function(data) {
        res.render('user', {username: req.params.username, data: data, profile: true})
    })
    .catch(function(err) {
      res.send(err)
    })
  } else {
    Snippit.find({'tag': {$in: [req.params.tag]}, 'author': req.params.username, 'public': true})
    .then(function(data) {
        res.render('user', {username: req.params.username, data: data})
    })
    .catch(function(err) {
      res.send(err)
    })
  }
})

router.get('/view/:id', requireLogin, function(req, res) {
    Snippit.findOne({'_id': req.params.id})
    .then(function(data) {
      if (data.author == req.user.username) {
        res.render('snippit', {data: data, edit:true})
      } else {
        res.render('snippit', {data: data, view: true})
      }
    })
    .catch(function(err) {
      res.send(err)
    })
})
module.exports = router
