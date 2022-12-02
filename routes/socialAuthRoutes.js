const express = require('express');
const authController = require('../controllers/authController');
const User = require('../models/userModel');

const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const router = express.Router();

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

//*************** GOOGLE ******************/
router.get(
  '/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/api/v1/auth/GoogleLogin',
    failureRedirect: '/api/v1/auth/login',
  })
);

authUser = (request, accessToken, refreshToken, profile, done) => {
  return done(null, profile);
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    authUser
  )
);

router.get('/GoogleLogin', authController.socialLogin);

//*************** FACEBOOK ******************/

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: [
        'id',
        'name',
        'emails',
        'displayName',
        'photos',
        'profileUrl',
      ],
    },

    function (accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);

router.get('/facebook/error', (req, res) => res.send('Unknown Error'));
router.get(
  '/facebook',
  passport.authenticate('facebook', {
    scope: ['email', 'public_profile'],
  })
);
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  authController.socialLogin
);

//*************** LINKEDIN ******************/

passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL,
      scope: ['r_emailaddress', 'r_liteprofile'],
    },
    function (token, tokenSecret, profile, done) {
      return done(null, profile);
    }
  )
);

router.route('/linkedin').get(
  passport.authenticate('linkedin', {
    scope: ['r_emailaddress', 'r_liteprofile'],
  })
);

router.get(
  '/linkedin/callback',
  passport.authenticate('linkedin', {
    successRedirect: '/api/v1/auth/linkedInLogin',
    failureRedirect: '/api/v1/auth/login',
  })
);

router.get('/linkedInLogin', authController.socialLogin);

router.get('/login', function (req, res) {
  res.send('<h1>Login</h1>');
});

module.exports = router;
