const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');
const imageSchema = require('../models/imageModel');
const roleAuthorizer = require('../utils/authorizationRoles');
const xl = require('excel4node');
const Category = require('../models/categoryModel');

exports.sendProductsEmails = catchasync(async (req, res, next) => {});

exports.getAllProducts = catchasync(async (req, res, next) => {
  var categorySearch;
  var features;

  if (req.query.categories) {
    delete req.query.categories;
  }

  if (req.query.categoriesNames) {
    categorySearch = req.query.categoriesNames;
    delete req.query.categoriesNames;

    categorySearch = categorySearch.split(',');
    const categoryIds = await Category.find({
      name: {
        $in: categorySearch.map((category) => new RegExp(category, 'i')),
      },
    });

    const categoryIdsArray = categoryIds.map((category) => category._id);

    features = new APIFeatures(
      Product.find({ categories: { $in: categoryIdsArray } }).populate({
        path: 'categories',
        select: 'name',
      }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
  } else if (req.query.categoriesIds) {
    categorySearch = req.query.categoriesIds;
    delete req.query.categoriesIds;

    categorySearch = categorySearch.split(',');
    features = new APIFeatures(
      Product.find({ categories: { $in: categorySearch } }).populate({
        path: 'categories',
        select: 'name',
      }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
  } else {
    features = new APIFeatures(
      Product.find().populate('categories', 'name'),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
  }

  const products = await features.query;

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: products.length,
    data: products,
  });
});

exports.getProductById = catchasync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('categories');

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: product,
  });
});

exports.createProduct = catchasync(async (req, res, next) => {
  const product = { ...req.body };

  if (req.body.imageCoverFile) {
    var imgCover = { ...imageSchema };
    imgCover.url = req.body.imageCoverFile;
    imgCover.isExternal = false;
    product.imageCover = imgCover;
  } else if (req.body.imageCover) {
    var imgCover = { ...imageSchema };
    imgCover.url = req.body.imageCover;
    imgCover.isExternal = true;
    product.imageCover = imgCover;
  }

  if (req.body.imagesFiles) {
    var images = [];
    req.body.imagesFiles.forEach((img) => {
      var image = { ...imageSchema };
      image.url = img;
      image.isExternal = false;
      images.push(image);
    });
    product.images = images;
  } else if (req.body.images) {
    var images = [];
    req.body.images.forEach((img) => {
      var image = { ...imageSchema };
      image.url = img;
      image.isExternal = true;
      images.push(image);
    });
    product.images = images;
  }

  product.user = req.user.id;

  const newProduct = await Product.create(product);

  res.status(201).json({
    status: 'success',
    data: newProduct,
  });
});

exports.updateProduct = catchasync(async (req, res, next) => {
  var product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  product.name = req.body.name;
  product.description = req.body.description;
  product.price = req.body.price;

  if (req.body.imageCoverFile) {
    var imgCover = { ...imageSchema };
    imgCover.url = req.body.imageCoverFile;
    imgCover.isExternal = false;
    product.imageCover = imgCover;
  } else if (req.body.imageCover) {
    var imgCover = { ...imageSchema };
    imgCover.url = req.body.imageCover;
    imgCover.isExternal = true;
    product.imageCover = imgCover;
  }

  if (req.body.imagesFiles) {
    var images = [];
    req.body.imagesFiles.forEach((img) => {
      var image = { ...imageSchema };
      image.url = img;
      image.isExternal = false;
      images.push(image);
    });

    //add images  to product images
    if (product.images) {
      console.log('found images');
      product.images = product.images.concat(images);
    } else {
      console.log('no images');
      product.images = images;
    }
  } else if (req.body.images) {
    var images = [];
    req.body.images.forEach((img) => {
      var image = { ...imageSchema };
      image.url = img;
      image.isExternal = true;
      images.push(image);
    });

    if (product.images) {
      console.log('found images');
      product.images = product.images.concat(images);
    } else {
      console.log('no images');
      product.images = images;
    }
  }

  // console.log(product);

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    product,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: updatedProduct,
  });
});

exports.deleteProduct = catchasync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, {
    active: false,
  });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.verifyProduct = catchasync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  product.verified = true;

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    product,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: updatedProduct,
  });
});

exports.suiviPaymentExcel = catchasync(async (req, res, next) => {
  var wb = new xl.Workbook();

  var ws = wb.addWorksheet('Sheet 1');

  var style = wb.createStyle({
    font: {
      color: '#000000',
      size: 12,
    },
    numberFormat: '$#,##0.00; ($#,##0.00); -',
  });

  // Set value of cell A1 to 100 as a number type styled with paramaters of style
  ws.cell(1, 1).string('Date').style(style);
  ws.cell(1, 2).string('Nom').style(style);
  ws.cell(1, 3).string('Prenom').style(style);
  ws.cell(1, 4).string('Email').style(style);
  ws.cell(1, 5).string('Telephone').style(style);
  ws.cell(1, 6).string('Montant').style(style);
  ws.cell(1, 7).string('Status').style(style);
  ws.cell(1, 8).string('Reference').style(style);
  ws.cell(1, 9).string('Type').style(style);

  // set dummy data
  var data = [
    {
      date: '2020-01-01',
      nom: 'John',
      prenom: 'Doe',
      email: 'anwer@gmail.com',
      telephone: '123456789',
      montant: '1000',
      status: 'success',
      reference: '123456789',
      type: 'credit',
    },
  ];

  // write data to excel
  var row = 2;
  data.forEach((item) => {
    ws.cell(row, 1).string(item.date).style(style);
    ws.cell(row, 2).string(item.nom).style(style);
    ws.cell(row, 3).string(item.prenom).style(style);
    ws.cell(row, 4).string(item.email).style(style);
    ws.cell(row, 5).string(item.telephone).style(style);
    ws.cell(row, 6).string(item.montant).style(style);
    ws.cell(row, 7).string(item.status).style(style);
    ws.cell(row, 8).string(item.reference).style(style);
    ws.cell(row, 9).string(item.type).style(style);
    row++;
  });

  wb.write('Payment.xlsx', res);
});
