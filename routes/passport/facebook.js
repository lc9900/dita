const router = require( 'express' ).Router(),
  passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy,
  { User, Location } = require('../../db').models,
  { generateToken } = require('../authMiddleware'),
  faker = require('faker')

let env;
if (process.env.NODE_ENV !== 'production') {
  env = require('../../env');
} else {
  env = process.env;
}

passport.use(
  new FacebookStrategy({
    clientID: env.FACEBOOK_APP_ID,
    clientSecret: env.FACEBOOK_APP_SECRET,
    callbackURL: env.FACEBOOK_CALLBACK,
    profileFields : [ 'emails', 'displayName', 'name', 'photos' ]
  },
  (accessToken, refreshToken, profile, done) => {
    const query = {
      facebookId: profile.id,
      email: profile.emails[0].value
    }

    const data = {
      username: faker.internet.userName().slice(0, 14),
      name: `${profile.name.givenName} ${profile.name.familyName}`,
      profilePic: profile.photos.length && profile.photos[0].value
    }

    User.passportAuth(query, data)
      .then(user => {
        return Location.create({ address: '', lat: 0, lng: 0, isHome: true, userId: user.id })
          .then(() => done(null, user))
      })
      .catch(err => {
        done(null, false)
      })
  })
)

router.get('/',
  passport.authenticate('facebook', { scope: 'email' }))

router.get('/verify',
  passport.authenticate('facebook', { session: false }),
  (req, res, next) => {
    if (!req.user) return res.sendStatus(403)
    res.redirect(`/?=${generateToken(req.user)}`) 
  })

module.exports = router
