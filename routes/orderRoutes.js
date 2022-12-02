const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/current')
  .get(authController.protect, orderController.getCurrentUserOrders);

router
  .route('/')
  .get(authController.protect, orderController.getAllOrders)
  .post(authController.protect, orderController.createOrder);

module.exports = router;
