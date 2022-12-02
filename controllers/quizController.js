const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');
const Quiz = require('../models/QuizModel');
const Question = require('../models/QuestionModel');

exports.getAllQuizs = catchasync(async (req, res, next) => {
  const features = new APIFeatures(Quiz.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const quizs = await features.query;

  res.status(200).json({
    status: 'success',
    results: quizs.length,
    data: quizs,
  });
});

exports.createQuiz = catchasync(async (req, res, next) => {});
