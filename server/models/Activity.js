const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    icon: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      default: "#38bdf8",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    performedBy: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Activity",
  activitySchema
);