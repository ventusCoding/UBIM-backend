const express = require('express');
const newsletterController = require('../controllers/newsletterController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, newsletterController.getAllNewsletters)
  .post(newsletterController.createNewsletter);

module.exports = router;
