const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadImage = (type) => {
  return upload.single(type);
};

exports.resizeImage = (type) => {
  return catchasync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `${type}-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/images/${type}/${req.file.filename}`);

    next();
  });
};

//************************************/

exports.uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

exports.resizeProductImages = catchasync(async (req, res, next) => {
  // 1) Cover image
  if (req.files.imageCover) {
    req.body.imageCoverFile = `product-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/images/products/${req.body.imageCoverFile}`);
  }
  // 2) Images
  if (req.files.images) {
    req.body.imagesFiles = [];

    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `product-${uuidv4()}-${Date.now()}.jpeg`;

        await sharp(file.buffer)
          .resize(500, 500)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/images/products/${filename}`);

        req.body.imagesFiles.push(filename);
      })
    );
  }

  next();
});

//************************************/

const multerVideoStorage = multer.memoryStorage();

const multerVideoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video')) {
    cb(null, true);
  } else {
    cb(new AppError('Not a video! Please upload only videos', 400), false);
  }
};

const uploadVideo = multer({
  storage: multerVideoStorage,
  fileFilter: multerVideoFilter,
});

exports.uploadChapterVideo = uploadVideo.single('video');

exports.saveChapterVideo = catchasync(async (req, res, next) => {
  if (!req.file) return next();

  const ext = req.file.originalname.split('.').pop();
  const name = req.file.originalname.split('.').slice(0, -1).join('.');
  req.file.filename = `${name}-${uuidv4()}-${Date.now()}.${ext}`;

  fs.writeFile(
    `public/videos/chapters/${req.file.filename}`,
    req.file.buffer,
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );

  next();
});
