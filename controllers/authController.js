const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const roleAuthorizer = require('../utils/authorizationRoles');
const mongoose = require('mongoose');
const imageSchema = require('../models/imageModel');
const Email = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: user,
  });
};

const createTokenAndRedirect = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  // res.redirect(
  //   `${process.env.FRONTEND_URL}/login?token=${token}&user=${JSON.stringify(
  //     user
  //   )}`
  // );

  console.log(process.env.FRONT_END_URL);

  res.redirect(`${process.env.FRONT_END_URL}/socialLogin?token=${token}`);
};

exports.loginAdmins = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // const user = await User.findOne({ email }).select('+password');

  // const user = await User.findOne({
  //   email,
  //   role: 'user',
  // }).select('+password');

  const user = await User.findOne({
    email,
    $nor: [{ role: 'user' }, { role: 'ubim-business' }],
  }).select('+password');

  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (user.password === undefined) {
    return next(new AppError('Incorrect Password', 400));
  }

  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!user.verified) {
    return next(new AppError('Account not verified!', 401));
  }

  createSendToken(user, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // const user = await User.findOne({ email }).select('+password');

  // const user = await User.findOne({
  //   email,
  //   role: 'user',
  // }).select('+password');

  const user = await User.findOne({
    email,
    $or: [{ role: 'user' }, { role: 'ubim-business' }],
  }).select('+password');

  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (user.password === undefined) {
    return next(new AppError('Incorrect Password', 400));
  }

  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!user.verified) {
    return next(new AppError('Account not verified!', 401));
  }

  createSendToken(user, 200, res);
});

exports.createAccount = catchAsync(async (req, res, next) => {
  // const authorized = roleAuthorizer(req.user.role, req.body.role);
  // if (!authorized) {
  //   return next(
  //     new AppError(
  //       'You do not have permission to create an account with this role',
  //       403
  //     )
  //   );
  // }
  let userData = req.body;

  const found = await User.findOne({
    email: userData.email,
    $or: [{ role: 'user' }, { role: 'ubim-business' }],
  });

  if (found) {
    return next(new AppError('Email already exists', 400));
  }

  if (req.file) {
    var img = imageSchema;
    img.url = req.file.filename;
    img.isExternal = false;

    userData.photo = img;
  } else if (req.body.photo) {
    var img = imageSchema;
    img.url = req.body.photo;
    img.isExternal = true;

    userData.photo = img;
  }

  const newUser = await User.create(userData);

  await newUser.save({ validateBeforeSave: false });

  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    message: 'Account created successfully',
    data: newUser,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (user.password) {
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError('Your current password is wrong.', 401));
    }
  }

  user.isSocialLogin = false;
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});

exports.changeUserPassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  const authorized = roleAuthorizer(req.user.role, user.role);
  if (!authorized) {
    return next(
      new AppError(
        'You do not have permission to change the password of this user',
        403
      )
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
    data: user,
  });
});

exports.sendWelcome = catchAsync(async (req, res, next) => {
  console.log('welcome');
  const usera = await User.findOne({
    email: req.body.email,
    $or: [{ role: 'user' }, { role: 'ubim-business' }],
  });

  const urla = `${process.env.FRONT_END_URL}/verify/${usera._id}`;

  await new Email(usera, urla).sendWelcome();

  return res.status(200).json({
    status: 'success',
  });
});

exports.signup = catchAsync(async (req, res, next) => {
  let userData = req.body;

  userData.role = 'user';

  //check if user exists
  const existingUser = await User.findOne({
    email: userData.email,
    $or: [{ role: 'user' }, { role: 'ubim-business' }],
  });

  if (existingUser) {
    return next(new AppError('User already exists', 400));
  }


  console.log("1111111");
  const newUser = await User.create(userData);
  
  const resetToken = newUser.createVerificationToken();
  await newUser.save({ validateBeforeSave: false });
  
  const verifUrl = `${process.env.FRONT_END_URL}/verify/${resetToken}`;
  
  await new Email(newUser, verifUrl).sendVerifyEmail();
  
  console.log("2222222");
  
  res.status(201).json({
    status: 'success',
    message: 'Verify your email to complete registration',
    url: verifUrl,
    devMessage: `Send a Patch request to ${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/emailVerification/${resetToken}`,
  });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  await User.findByIdAndUpdate(user._id, { verified: true });

  const verifiedUser = await User.findById(user._id);

  const url = `${process.env.FRONT_END_URL}`;

  await new Email(verifiedUser, url).sendWelcome();

  res.status(201).json({
    status: 'success',
    message: 'Congratulation you complete your registration. try to login now.',
  });
});

exports.resendVerificationEmail = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(
      new AppError('Tell us your email to send the verification email', 404)
    );
  }

  const user = await User.find({ email: req.body.email });

  const newUser = user[0];

  const resetToken = newUser.createVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  const verifUrl = `${process.env.FRONT_END_URL}/verify/${resetToken}`;

  await new Email(newUser, verifUrl).sendVerifyEmail();

  res.status(201).json({
    status: 'success',
    message: 'Verify your email to complete registration',
    url: verifUrl,
    devMessage: `Send a Patch request to ${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/emailVerification/${resetToken}`,
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
    $or: [{ role: 'user' }, { role: 'ubim-business' }],
  });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${process.env.FRONT_END_URL}/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendForgotPassword();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email successfully !',
      devMessage: `Send a Patch request to ${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/resetPassword/${resetToken}`,
      // url: resetURL,
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError(err, 500));
  }
});

exports.checkResetPassword = catchAsync(async (req, res, next) => {
  const token = req.body.token;

  if (!token) {
    return next(new AppError('Token is required', 400));
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  res.status(200).json({
    status: 'success',
    message: 'Token is valid',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
    $or: [{ role: 'user' }, { role: 'ubim-business' }],
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.isSocialLogin = false;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

// *************** SOCIAL AUTHENTICATION ***************
exports.socialLogin = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('No user found', 404));
  }

  const photo = { ...imageSchema };
  photo.url = req.user.photos[0].value;
  photo.isExternal = true;

  const user = {
    email: req.user.emails[0].value,
    firstName: req.user.name.givenName,
    lastName: req.user.name.familyName,
    role: 'user',
    photo,
    isSocialLogin: true,
    verified: true,
  };

  const existingUser = await User.findOne({
    email: user.email,
    $or: [{ role: 'user' }, { role: 'ubim-business' }],
  });

  if (existingUser) {
    console.log('User already exists');
    // createSendToken(existingUser, 200, res);
    createTokenAndRedirect(existingUser, 200, res);
  } else {
    console.log('User does not exist');
    const newUser = await User.create(user);

    // createSendToken(newUser, 200, res);
    createTokenAndRedirect(newUser, 200, res);
  }
});

// **************** PROTECTION MIDDLEWARES ****************

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in ! Please login to get access.', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist.')
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
