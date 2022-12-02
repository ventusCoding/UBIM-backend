const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    formationRating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Formation Rating is required!'],
    },
    contentRating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Content Rating is required!'],
    },
    formateurRating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Formateur Rating is required!'],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
    anonymous: {
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

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'product',
    select: 'title',
  }).populate({
    path: 'user',
    select: 'firstName lastName photo',
  });

  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
