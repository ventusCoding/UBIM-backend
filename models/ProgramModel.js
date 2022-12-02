const mongoose = require('mongoose');

const programSchema = new mongoose.Schema(
  {
    chapters: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Chapter',
        }
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Program = mongoose.model('Program', programSchema);

module.exports = Program;
