const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');
const Contact = require('../models/contactModel');

exports.getAllContacts = catchasync(async (req, res, next) => {
  const features = new APIFeatures(Contact.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const contacts = await features.query;

  res.status(200).json({
    status: 'success',
    results: contacts.length,
    data: contacts,
  });
});

exports.createContact = catchasync(async (req, res, next) => {
  const contact = await Contact.create(req.body);

  const url = `${process.env.FRONT_END_URL}`;

  res.status(201).json({
    status: 'success',
    data: contact,
  });
});
