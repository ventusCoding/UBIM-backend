const express = require('express');
const contactController = require('../controllers/contactController');
const authController = require('../controllers/authController');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, contactController.getAllContacts)
  .post(contactController.createContact);

module.exports = router;
