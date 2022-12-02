const express = require('express');
const quizController = require('../controllers/quizController');
const authController = require('../controllers/authController');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, quizController.getAllQuizs)
  .post(
    authController.protect,
    uploadController.uploadImage('image'),
    uploadController.resizeImage('quizs'),
    quizController.createQuiz
  );

module.exports = router;
