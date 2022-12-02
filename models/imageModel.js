const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      // required: [true, "Please provide an image URL"],
    },
    isExternal: {
      type: Boolean,
      // required: [true, "Please provide a type : external or not"],
    },
  },
  {
    // timestamps: true,
    _id : false,
  }
);

module.exports = imageSchema;
