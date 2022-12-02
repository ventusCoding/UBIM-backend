const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

router
  .route('/verify/:id')
  .patch(
    authController.protect,
    authController.restrictTo('super-admin'),
    productController.verifyProduct
  );

router
  .route('/suiviPayment')
  .get(
    // authController.protect,
    // authController.restrictTo('super-admin', 'admin'),
    productController.suiviPaymentExcel
  );

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    authController.restrictTo('super-admin', 'admin', 'moderateur'),
    uploadController.uploadProductImages,
    uploadController.resizeProductImages,
    productController.createProduct
  );

router
  .route('/:id')
  .get(productController.getProductById)
  .patch(
    authController.protect,
    authController.restrictTo('super-admin', 'admin', 'moderateur'),
    uploadController.uploadProductImages,
    uploadController.resizeProductImages,
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo('super-admin', 'admin'),
    productController.deleteProduct
  );

module.exports = router;
