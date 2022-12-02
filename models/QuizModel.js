const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us a quiz name!'],
    },
    description: {
      type: String,
      required: [true, 'Please tell us a quiz description!'],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'A quiz must belong to a category'],
    },
    level: {
      type: String,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'A quiz must belong to a product'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A quiz must belong to a user'],
    },
    prerequis: {
      type: String,
    },
    cible: {
      type: String,
    },
    language: {
      type: String,
      required: [true, 'A Product must have a language'],
    },
    active: {
        type: Boolean,
        default: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    questions: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Question',
        },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
