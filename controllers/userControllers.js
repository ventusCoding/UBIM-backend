const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');
const imageSchema = require('../models/imageModel');
const roleAuthorizer = require('../utils/authorizationRoles');
const PendingUser = require('../models/pendingUserModel');
const Email = require('../utils/email');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchasync(async (req, res, next) => {
  // not equale current user
  const features = new APIFeatures(
    User.find({
      _id: { $ne: req.user.id },
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: users,
  });
});

exports.getCurrentUser = catchasync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.getUserById = catchasync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.deleteUserByAdmin = catchasync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.deleteMe = catchasync(async (req, res, next) => {
  console.log(req.user.id);
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getPendingUsers = catchasync(async (req, res, next) => {
  const features = new APIFeatures(
    PendingUser.find({
      _id: { $ne: req.user.id },
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: users,
  });
});

exports.addPendingUsers = catchasync(async (req, res, next) => {
  const pendingUser = req.body;

  var userToRegister;
  var newPendingUser;

  if (
    pendingUser.become !== 'instructor' &&
    pendingUser.become !== 'ubim-business' &&
    pendingUser.become !== 'certified'
  ) {
    return next(
      new AppError(
        'Become is either: instructor, ubim-business, certified',
        400
      )
    );
  }

  if (pendingUser.become === 'instructor') {
    switch (true) {
      case !pendingUser.firstName:
        return next(new AppError('Please provide your first name', 400));
      case !pendingUser.lastName:
        return next(new AppError('Please provide your last name', 400));
      case !pendingUser.phone:
        return next(new AppError('Please provide your phone number', 400));
      case !pendingUser.email:
        return next(new AppError('Please provide your email', 400));
      case !pendingUser.education:
        return next(new AppError('Please provide your education level', 400));
      // case !pendingUser.professionalCertification:
      //   return next(
      //     new AppError('Please provide your professional certification', 400)
      //   );
      // case !pendingUser.professionalState: //TODO: Fix this
      //   return next(
      //     new AppError('Please provide your professional state', 400)
      //   );
      case !pendingUser.address:
        return next(new AppError('Please provide your address', 400));
      case !pendingUser.availability:
        return next(new AppError('Please provide your availability', 400));
      case !pendingUser.textBox:
        return next(new AppError('Please provide your text box', 400));
      default:
        break;
    }

    userToRegister = {
      become: pendingUser.become,
      firstName: pendingUser.firstName,
      lastName: pendingUser.lastName,
      phone: pendingUser.phone,
      email: pendingUser.email,
      education: pendingUser.education,
      professionalCertification: pendingUser.professionalCertification,
      professionalState: pendingUser.professionalState,
      address: pendingUser.address,
      availability: pendingUser.availability,
      textBox: pendingUser.textBox,
    };

    if (pendingUser.companyName) {
      userToRegister.companyName = pendingUser.companyName;
    }
    const url = `${process.env.FRONT_END_URL}`;

    await new Email(req.body, url).sendBecomeInstructor();
  }

  if (pendingUser.become === 'ubim-business') {
    switch (true) {
      case !pendingUser.firstName:
        return next(new AppError('Please provide your first name', 400));
      case !pendingUser.lastName:
        return next(new AppError('Please provide your last name', 400));
      case !pendingUser.phone:
        return next(new AppError('Please provide your phone number', 400));
      case !pendingUser.companyRole:
        return next(new AppError('Please provide your company role', 400));
      case !pendingUser.companyEmail:
        return next(new AppError('Please provide your company email', 400));
      case !pendingUser.companyName:
        return next(new AppError('Please provide your company name', 400));
      case !pendingUser.companyAddress:
        return next(new AppError('Please provide your company address', 400));
      case !pendingUser.companyActivity:
        return next(new AppError('Please provide your company activity', 400));
      case !pendingUser.subject:
        return next(new AppError('Please provide your subject', 400));
      case !pendingUser.textBox:
        return next(new AppError('Please provide your text box', 400));

      default:
        break;
    }

    userToRegister = {
      become: pendingUser.become,
      firstName: pendingUser.firstName,
      lastName: pendingUser.lastName,
      phone: pendingUser.phone,
      companyRole: pendingUser.companyRole,
      companyEmail: pendingUser.companyEmail,
      companyName: pendingUser.companyName,
      companyAddress: pendingUser.companyAddress,
      companyActivity: pendingUser.companyActivity,
      subject: pendingUser.subject,
      textBox: pendingUser.textBox,
    };

    const url = `${process.env.FRONT_END_URL}`;

    const user = req.body;
    user.email = pendingUser.companyEmail;

    await new Email(user, url).sendBecomeUBIMBusiness();
  }

  if (pendingUser.become === 'certified') {
    switch (true) {
      case !pendingUser.firstName:
        return next(new AppError('Please provide your first name', 400));
      case !pendingUser.lastName:
        return next(new AppError('Please provide your last name', 400));
      case !pendingUser.phone:
        return next(new AppError('Please provide your phone number', 400));
      case !pendingUser.email:
        return next(new AppError('Please provide your email', 400));
      case !pendingUser.certification:
        return next(new AppError('Please provide your certification', 400));
      case !pendingUser.textBox:
        return next(new AppError('Please provide your text box', 400));
      default:
        break;
    }

    userToRegister = {
      become: pendingUser.become,
      firstName: pendingUser.firstName,
      lastName: pendingUser.lastName,
      phone: pendingUser.phone,
      email: pendingUser.email,
      certification: pendingUser.certification,
      textBox: pendingUser.textBox,
    };
  }

  newPendingUser = await PendingUser.create(userToRegister);

  res.status(201).json({
    status: 'success',
    data: newPendingUser,
  });
});

exports.verifyUserAccount = catchasync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  const authorized = roleAuthorizer(req.user.role, user.role);
  if (!authorized) {
    return next(
      new AppError(
        'You do not have permission to delete an account with this role',
        403
      )
    );
  }

  user.verified = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Account verified successfully',
    data: user,
  });
});

exports.deleteUserByAdmin = catchasync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  const authorized = roleAuthorizer(req.user.role, user.role);
  if (!authorized) {
    return next(
      new AppError(
        'You do not have permission to delete an account with this role',
        403
      )
    );
  }

  await User.findByIdAndUpdate(req.params.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateMe = catchasync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }

  if (req.body.role) {
    return next(new AppError('You cannot change your role', 403));
  }

  const email = req.body.email;

  const foundUserWithEmail = await User.findOne({
    email,
    $or: [{ role: 'user' }, { role: 'ubim-business' }],
  });

  if (foundUserWithEmail && foundUserWithEmail._id.toString() !== req.user.id) {
    return next(new AppError('This email is already in use', 400));
  }

  // const filteredBody = filterObj(req.body, 'name');
  const filteredBody = req.body;

  var img = imageSchema;

  if (req.file) {
    img.url = req.file.filename;
    img.isExternal = false;

    filteredBody.photo = img;
  } else {
    if (req.body.photo) {
      img.url = req.body.photo;
      img.isExternal = true;

      filteredBody.photo = img;
    }
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});
