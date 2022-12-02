const express = require('express');
const programeController = require('../controllers/programeController');
const authController = require('../controllers/authController');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, programeController.getAllPrograms)
  .post(
    authController.protect,
    programeController.createProgram
  );

module.exports = router;
