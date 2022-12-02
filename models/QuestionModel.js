const mongoose = require('mongoose');
const imageSchema = require('./imageModel');

//TODO: Answer must belong to option that means option will be separate as a model and answer will be a reference to option
const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'A question must have a question'],
    },
    options: [
      {
        type: String,
      },
    ],
    answer: {
      type: String,
      required: [true, 'A question must have an answer'],
    },
    image: {
      type: imageSchema,
      default: {
        url: 'no-image.png',
        isExternal: false,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
