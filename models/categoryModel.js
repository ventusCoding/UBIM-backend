const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us a category name!'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A category name must have less or equal then 40 characters',
      ],
    },
    description : {
      type: String,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Category must belong to a user.'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
