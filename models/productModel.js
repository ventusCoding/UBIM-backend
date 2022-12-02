const mongoose = require('mongoose');
const validator = require('validator');
const imageSchema = require('./imageModel');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A Product must have a title'],
      trim: true,
      maxlength: [
        50,
        'A prudct title must have less or equal than 50 characters',
      ],
      minlength: [
        3,
        'A product title must have more or equal than 3 characters',
      ],
    },
    categories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: [true, 'A product must belong to a category'],
      },
    ],
    subtitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A Product must Have a description'],
      minlength: [
        10,
        'A product description must have more or equal than 10 characters',
      ],
      maxlength: [
        500,
        'A product description must have less or equal than 500 characters',
      ],
    },
    imageCover: {
      type: imageSchema,
      default: {
        url: 'no-image.png',
        isExternal: false,
      },
    },
    images: [imageSchema],
    price: {
      type: Number,
      required: [true, 'A Product must have a price'],
    },
    discount: {
      type: Number,
      min: [0, 'Discount must be between 0 and 100'],
      max: [100, 'Discount must be between 0 and 100'],
      default: 0,
    },
    discountEnds: {
      type: Date,
    },
    language: {
      type: String,
      required: [true, 'A Product must have a language'],
    },
    orderNumber: {
      type: Number,
      default: 0,
    },
    certification: {
      type: mongoose.Schema.ObjectId,
      ref: 'Certification',
    },
    online: {
      type: String,
    },
    programString: {
      type: String,
    },
    attestation: {
      type: String,
    },
    cible: {
      type: String,
    },
    prerequis: {
      type: String,
    },
    disponibilite: {
      type: String,
      enum: ['disponible', 'bientot', 'indisponible'],
      default: 'disponible',
    },
    ratingsAverage: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    material: {
      type: String,
    },
    level: {
      type: String,
    },
    quiz: {
      type: mongoose.Schema.ObjectId,
      ref: 'Quiz',
    },
    program: {
      type: mongoose.Schema.ObjectId,
      ref: 'Program',
    },
    duration: {
      type: String,
      required: [true, 'A Product must have a duration'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A Product must have a user'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

productSchema.virtual('priceAfterDiscount').get(function () {
  if (this.discountEnds && this.discountEnds < Date.now()) {
    return null;
  }
  return this.price * (1 - this.discount / 100);
});

productSchema.virtual('discountEndsInMessage').get(function () {
  if (this.discountEnds) {
    const now = new Date();
    const discountEnds = new Date(this.discountEnds);
    const diff = discountEnds - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const minutes = Math.floor(diff / (1000 * 60)) % 60;
    const seconds = Math.floor(diff / 1000) % 60;
    if (days > 0) {
      return `${days} days left`;
    } else if (hours > 0) {
      return `${hours} hours left`;
    } else if (minutes > 0) {
      return `${minutes} minutes left`;
    } else if (seconds > 0) {
      return `${seconds} seconds left`;
    } else {
      // return 'Discount has expired';

      this.discount = 0;

      this.save({ validateBeforeSave: false });

      return null;
    }
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
