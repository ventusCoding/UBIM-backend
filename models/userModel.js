const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const imageSchema = require('./imageModel');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      // required: [true, 'Please tell us your firstName!'],
    },
    lastName: {
      type: String,
      // required: [true, 'Please tell us your lastName!'],
    },
    education: {
      type: String,
      enum: {
        values: ['bac', 'bac +3', 'bac +5', 'plus'],
        message: 'Education level is either: bac, bac +3, bac +5, plus',
      },
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
    professionalCertification: {
      type: Boolean,
    },
    phone: {
      type: String,
      // required: [true, 'Please tell us your phone!'],
      validator: validator.isMobilePhone,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      // unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
      type: imageSchema,
      default: {
        url: 'default.jpg',
        isExternal: false,
      },
    },
    role: {
      type: String,
      enum: [
        'super-admin',
        'admin',
        'moderateur',
        'sous-moderateur',
        'instructor',
        'user',
        'ubim-business',
        'certified',
      ],
      required: [true, 'Please provide a role'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      // required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
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
    isSocialLogin: {
      type: Boolean,
      default: false,
    },
    certifications: {
      type: [mongoose.Schema.ObjectId],
      ref: 'Certification',
    },
    address: {
      type: String,
    },
    passwordConfirm: {
      type: String,
      // required: [true, 'Please confirm your password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    verificationToken: String,
    verificationExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.createVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.verificationExpires = Date.now() + 10 * 60 * 1000;

  return verificationToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
