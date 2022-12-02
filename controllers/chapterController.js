const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');
const Chapter = require('../models/ChapterModel');
const imageSchema = require('../models/imageModel');

exports.getAllChapters = catchasync(async (req, res, next) => {
  const features = new APIFeatures(Chapter.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const chapters = await features.query;

  res.status(200).json({
    status: 'success',
    results: chapters.length,
    data: chapters,
  });
});

exports.createChapter = catchasync(async (req, res, next) => {
  const newChapter = await Chapter.create(req.body);

  if (req.file) {
    var image = { ...imageSchema };
    image.url = req.file.filename;
    image.isExternal = false;
    newChapter.video = image;
  } else if (req.body.videoUrl) {
    var image = { ...imageSchema };
    image.url = req.body.videoUrl;
    image.isExternal = true;
    newChapter.video = image;
  }

  res.status(201).json({
    status: 'success',
    data: newChapter,
  });
});
