const express = require('express');
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(authController.protect, categoryController.createCategory);

router
  .route('/:id')
  .get(categoryController.getCategoryById)
  .delete(authController.protect, categoryController.deleteCategory);

module.exports = router;
