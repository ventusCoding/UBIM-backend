const mongoose = require('mongoose');
const validator = require('validator');

const pendingUserSchema = new mongoose.Schema({
  become: {
    type: String,
    required: [true, 'Please provide a role'],
    enum: {
      values: ['instructor', 'ubim-business', 'certified'],
      message: 'Become is either: instructor, ubim-business, certified',
    },
  },
  status : {
    type: String,
    default: 'pending',
    enum: {
      values: ['pending', 'accepted', 'rejected'],
      message: 'Status is either: pending, accepted, rejected',
    },
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    lowercase: true,
    // unique: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  education: {
    type: String,
    enum: {
      values: ['bac', 'bac +3', 'bac +5', 'plus'],
      message: 'Education level is either: bac, bac +3, bac +5, plus',
    },
  },
  professionalCertification: {
    type: Boolean,
  },
  professionalState: {
    type: String,
    // required: [true, 'Please tell us your professionalState!'],
    enum: {
      values: ['student', 'unemployed', 'professional', 'company'],
      message:
        'professionalState is either: student, unemployed, professional, company',
    },
  },
  certifications: {
    type: [mongoose.Schema.ObjectId],
    ref: 'Certification',
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
    validator: validator.isMobilePhone,
  },
  companyName: {
    type: String,
  },
  availability: {
    type: String,
    enum: {
      values: ['weekends', 'part-time', 'full-time'],
      message: 'Availability is either: weekends, part-time, full-time',
    },
  },
  textBox: {
    type: String,
  },
  companyRole: {
    type: String,
  },
  companyEmail: {
    type: String,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  companyAddress: {
    type: String,
  },
  companyActivity: {
    type: String,
  },
  subject: {
    type: String,
  },
});

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);

module.exports = PendingUser;
