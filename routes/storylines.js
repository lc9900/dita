const router = require('express').Router()
const { verifyToken } = require('./authMiddleware')
const { StoryLine, Post, Reply } = require('../db').models

router.get('/mystorylines', verifyToken, (req, res, next) => {
  StoryLine.findAll({ where: {
    userId: req.user.id,
  },
    order: [['updatedAt', 'DESC']],
    include: [ { model: Post, include: [ Reply ] } ]
  })
  .then(storylines => res.send(storylines))
  .catch(next)
})

router.post('/', verifyToken, (req, res, next) => {
  const { title, description, selection } = req.body
  StoryLine.create({ title, description, userId: req.user.id })
    .then(newstoryline => (
      Post.findById(selection.value)
        .then(post => post.update({ storylineId: newstoryline.id }))
    ))
    .then(() => res.sendStatus(200))
})

router.get('/', (req, res, next) => {
  StoryLine.findAll({
    order: [['updatedAt', 'DESC']],
    include: [ { model: Post, include: [ Reply ] }]
  })
  .then(storylines => {
    res.send(storylines)
  })
  .catch(next);
})

module.exports = router
