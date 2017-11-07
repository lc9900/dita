const router = require('express').Router()
const { User, Post } = require('../db').models
const { verifyToken } = require('./authMiddleware')

router.get('/myposts', verifyToken, (req, res, next) => {
  Post.findPosts(req.user.id)
    .then(posts => res.send(posts))
})

module.exports = router