const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');
const Newsletter = require('../models/newsletterModel');
const Email = require('../utils/email');

exports.getAllNewsletters = catchasync(async (req, res, next) => {
  const features = new APIFeatures(Newsletter.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const newsletters = await features.query;

  res.status(200).json({
    status: 'success',
    results: newsletters.length,
    data: newsletters,
  });
});

exports.createNewsletter = catchasync(async (req, res, next) => {
  const newUserSubs = await Newsletter.findOne({ email: req.body.email });

  if (newUserSubs) {
    return next(
      new AppError('You are already subscribed to our newsletter', 400)
    );
  }

  const newsletter = await Newsletter.create(req.body);

  const url = `${process.env.FRONT_END_URL}`;

  await new Email(req.body, url).sendNewsLetter();

  res.status(201).json({
    status: 'success',
    data: newsletter,
  });
});
