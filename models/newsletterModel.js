const mongoose = require('mongoose');
const validator = require('validator');

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please tell us your email!'],
      validator: [validator.isEmail, 'Please provide a valid email'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

module.exports = Newsletter;
