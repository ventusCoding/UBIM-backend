const mongoose = require('mongoose');
const imageSchema = require('./imageModel');

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A Chapter must have a title'],
    },
    headlines: [
      {
        type: String,
      },
    ],
    video: {
      type: imageSchema,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;
