const mongoose = require('mongoose');
const validator = require('validator');

const contactSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please tell us your first name!'],
    },
    lastName: {
      type: String,
      required: [true, 'Please tell us your last name!'],
    },
    phone: {
      type: String,
      required: [true, 'Please tell us your phone!'],
      validator: [
        validator.isMobilePhone,
        'Please provide a valid phone number',
      ],
    },
    email: {
      type: String,
      required: [true, 'Please tell us your email!'],
      validator: [validator.isEmail, 'Please provide a valid email'],
    },
    message: {
      type: String,
      required: [true, 'Please tell us your message!'],
      maxlength: [
        255,
        'A newsletter must have less or equal then 40 characters',
      ],
      minlength: [
        10,
        'A newsletter must have more or equal then 10 characters',
      ],
    },
    professionalState: {
      type: String,
      required: [true, 'Please tell us your professionalState!'],
      enum: {
        values: ['student', 'unemployed', 'professional', 'company'],
        message:
          'professionalState is either: student, unemployed, professional, company',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
