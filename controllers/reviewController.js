const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: reviews,
  });
});

exports.getReviewsByProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const reviews = await Review.find({
    product: productId,
  });

  const reviewsWithAnonymous = reviews.map((review) => {
    if (review.anonymous) {
      review.user.firstName = 'Anonymous';
      review.user.lastName = '';
      // review.user = null;
    }
    return review;
  });

  res.status(200).json({
    status: 'success',
    results: reviewsWithAnonymous.length,
    data: reviewsWithAnonymous,
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.body.product);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  const order = await Order.findOne({
    user: req.user.id,
    product: req.body.product,
  });

  if (!order) {
    return next(new AppError('You have not ordered this product', 400));
  }

  const userReview = await Review.findOne({
    user: req.user.id,
    product: req.body.product,
  });

  if (userReview) {
    return next(new AppError('You have already reviewed this product', 400));
  }

  let newReview = req.body;

  const totalRating =
    (newReview.formationRating +
      newReview.contentRating +
      newReview.formateurRating) /
    3;

  newReview.rating = totalRating;

  newReview.user = req.user.id;

  const createdReview = await Review.create(newReview);

  const reviews = await Review.find({ product: req.body.product });

  const averageRating = await Review.aggregate([
    {
      $match: { product: product._id },
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  const averageRatingValue = averageRating[0].averageRating;

  product.numReviews = reviews.length;
  product.ratingsAverage = averageRatingValue.toFixed(1);

  await product.save({ validateBeforeSave: false });

  res.status(201).json({
    status: 'success',
    data: createdReview,
  });
});
