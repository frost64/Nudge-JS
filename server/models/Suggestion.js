const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["new", "read"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Suggestion",
  suggestionSchema
);