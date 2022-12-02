const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us a certification name!'],
      unique: true,
      trim: true,
    },
    pdf: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Certification = mongoose.model('Certification', certificationSchema);

module.exports = Certification;
