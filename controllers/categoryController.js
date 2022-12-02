const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');
const imageSchema = require('../models/imageModel');
const roleAuthorizer = require('../utils/authorizationRoles');
const xl = require('excel4node');
const Category = require('../models/categoryModel');

exports.getAllCategories = catchasync(async (req, res, next) => {
  const features = new APIFeatures(Category.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const categories = await features.query;
  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: categories,
  });
});

exports.getCategoryById = catchasync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: category,
  });
});

exports.createCategory = catchasync(async (req, res, next) => {
  const category = { ...req.body };

  category.user = req.user.id;

  const newCategory = await Category.create(category);
  
  res.status(201).json({
    status: 'success',
    data: newCategory,
  });
});

exports.deleteCategory = catchasync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  // Delete this category from all products
  await Product.updateMany(
    { categories: { $in: [req.params.id] } },
    { $pull: { categories: req.params.id } }
  );

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
