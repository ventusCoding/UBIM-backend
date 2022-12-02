const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');
const Program = require('../models/ProgramModel');

exports.getAllPrograms = catchasync(async (req, res, next) => {
  const features = new APIFeatures(Program.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const programs = await features.query;

  res.status(200).json({
    status: 'success',
    results: programs.length,
    data: programs,
  });
});

exports.createProgram = catchasync(async (req, res, next) => {
  const newProgram = await Program.create(req.body);

  res.status(201).json({
    status: 'success',
    data: newProgram,
  });
});
