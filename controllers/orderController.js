const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');
const Order = require('../models/orderModel');
const Email = require('../utils/email');
const User = require('../models/userModel');

exports.getAllOrders = catchasync(async (req, res, next) => {
  const features = new APIFeatures(Order.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const orders = await features.query;
  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: orders,
  });
});

exports.getCurrentUserOrders = catchasync(async (req, res, next) => {
  const features = new APIFeatures(
    Order.find({ user: req.user.id })
      .populate('user', 'firstName lastName email')
      .populate('product', 'title price imageCover'),

    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const orders = await features.query;
  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: orders,
  });
});

exports.createOrder = catchasync(async (req, res, next) => {
  const product = await Product.findById(req.body.product);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  const userOrder = await Order.findOne({
    user: req.user.id,
    product: req.body.product,
  });

  // if (userOrder) {
  //   return next(
  //     new AppError('You already have an order for this product', 400)
  //   );
  // }

  let order = {
    product: req.body.product,
    user: req.user.id,
  };

  order = await Order.create(order);

  product.orderNumber += 1;
  const updatedOrder = await product.save({ validateBeforeSave: false });

  const url = `${process.env.FRONT_END_URL}`;

  const chosenProductNames = product.title;

  const foundUser = await User.findById(req.user.id);

  const contactNumber = process.env.CONTACT_NUMBER;

  if (req.body.yourEmail) {
    const hkUser = await User.findOne({ email: req.body.yourEmail });
    await new Email(hkUser, url).sendOrder(chosenProductNames, contactNumber);
  }

  await new Email(foundUser, url).sendOrder(chosenProductNames, contactNumber);

  res.status(201).json({
    status: 'success',
    data: order,
  });
});
