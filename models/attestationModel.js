const mongoose = require('mongoose');

const attestationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us a attestation name!'],
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

const Attestation = mongoose.model('Attestation', attestationSchema);

module.exports = Attestation;
