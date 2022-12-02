const express = require('express');
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authController');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

router.get('/sendWelcome', authController.sendWelcome);

router.get('/current', authController.protect, userController.getCurrentUser);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/loginAdmins', authController.loginAdmins);

router.post('/checkResetPasswordToken', authController.checkResetPassword);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/emailVerification/:token', authController.verifyEmail);
router.post('/resendVerificationEmail', authController.resendVerificationEmail);

router
  .route('/become')
  .get(authController.protect, userController.getPendingUsers)
  .post(userController.addPendingUsers);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.patch(
  '/updateMe',
  authController.protect,
  uploadController.uploadImage('photo'),
  uploadController.resizeImage('users'),
  userController.updateMe
);

router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
  .route('/verifyUserAccount/:id')
  .patch(
    authController.protect,
    authController.restrictTo(
      'super-admin',
      'admin',
      'moderateur',
      'sous-moderateur',
      'instructeur'
    ),
    userController.verifyUserAccount
  );

router.patch(
  '/changeUserPassword/:id',
  authController.protect,
  authController.restrictTo(
    'super-admin',
    'admin',
    'moderateur',
    'sous-moderateur',
    'instructeur'
  ),
  authController.changeUserPassword
);

router.delete(
  '/deleteUserAccount/:id',
  authController.protect,
  authController.restrictTo(
    'super-admin',
    'admin',
    'moderateur',
    'sous-moderateur',
    'instructeur'
  ),
  userController.deleteUserByAdmin
);

router.route('/:id').get(authController.protect, userController.getUserById);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo(
      'super-admin',
      'admin',
      'moderateur',
      'sous-moderateur',
      'instructeur'
    ),
    userController.getAllUsers
  );

router.post(
  '/createAccount',
  // authController.protect,
  // authController.restrictTo(
  //   'super-admin',
  //   'admin',
  //   'moderateur',
  //   'sous-moderateur',
  //   'instructeur'
  // ),
  uploadController.uploadImage('photo'),
  uploadController.resizeImage('users'),
  authController.createAccount
);

module.exports = router;
