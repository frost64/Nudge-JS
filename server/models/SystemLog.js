const mongoose = require("mongoose");

const SYSTEM_LOG_LEVELS = [
  "info",
  "success",
  "warning",
  "error",
];

const SYSTEM_LOG_CATEGORIES = [
  "startup",
  "database",
  "authentication",
  "security",
  "routing",
  "mail",
  "api",
  "scheduler",
  "system",
];

const systemLogSchema =
  new mongoose.Schema(
    {
      level: {
        type: String,
        trim: true,
        lowercase: true,
        enum: {
          values: SYSTEM_LOG_LEVELS,
          message:
            "Log level must be info, success, warning, or error.",
        },
        default: "info",
      },

      category: {
        type: String,
        trim: true,
        lowercase: true,
        enum: {
          values: SYSTEM_LOG_CATEGORIES,
          message:
            "Invalid system log category.",
        },
        default: "system",
      },

      source: {
        type: String,
        required: [
          true,
          "Log source is required.",
        ],
        trim: true,
        minlength: [
          1,
          "Log source is required.",
        ],
        maxlength: [
          100,
          "Log source cannot exceed 100 characters.",
        ],
      },

      message: {
        type: String,
        required: [
          true,
          "Log message is required.",
        ],
        trim: true,
        minlength: [
          1,
          "Log message is required.",
        ],
        maxlength: [
          2000,
          "Log message cannot exceed 2000 characters.",
        ],
      },

      /*
       * Mixed is retained because log metadata can vary
       * between authentication, API, database, and system events.
       */
      details: {
        type: mongoose.Schema.Types.Mixed,
        default: () => ({}),
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

/*
 * Supports the main system-log view ordered newest first.
 */
systemLogSchema.index({
  createdAt: -1,
});

/*
 * Supports filtering logs by severity.
 */
systemLogSchema.index({
  level: 1,
  createdAt: -1,
});

/*
 * Supports filtering logs by category.
 */
systemLogSchema.index({
  category: 1,
  createdAt: -1,
});

/*
 * Supports filtering logs by source.
 */
systemLogSchema.index({
  source: 1,
  createdAt: -1,
});

module.exports =
  mongoose.models.SystemLog ||
  mongoose.model(
    "SystemLog",
    systemLogSchema
  );