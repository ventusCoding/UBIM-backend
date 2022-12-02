const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Order must belong to a product.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user.'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected'],
        message: 'Status is either: pending, accepted, rejected',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
