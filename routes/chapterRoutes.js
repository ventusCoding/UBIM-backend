const express = require('express');
const chapterController = require('../controllers/chapterController');
const authController = require('../controllers/authController');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, chapterController.getAllChapters)
  .post(
    authController.protect,
    uploadController.uploadChapterVideo,
    uploadController.saveChapterVideo,
    chapterController.createChapter
  );

module.exports = router;
