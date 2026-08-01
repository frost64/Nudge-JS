const mongoose = require("mongoose");

const systemLogSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },

    category: {
      type: String,
      enum: [
        "startup",
        "database",
        "authentication",
        "security",
        "routing",
        "mail",
        "api",
        "scheduler",
        "system",
      ],
      default: "system",
    },

    source: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SystemLog",
  systemLogSchema
);