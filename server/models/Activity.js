const mongoose = require("mongoose");

const DEFAULT_ACTIVITY_COLOR =
  "#38bdf8";

function requiredTrimmedString(
  maximumLength
) {
  return {
    type: String,
    required: true,
    trim: true,
    maxlength: maximumLength,
  };
}

const activitySchema =
  new mongoose.Schema(
    {
      type: requiredTrimmedString(100),

      message:
        requiredTrimmedString(500),

      icon: requiredTrimmedString(100),

      color: {
        type: String,
        trim: true,
        maxlength: 50,
        default:
          DEFAULT_ACTIVITY_COLOR,
      },

      user: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        default: null,
      },

      performedBy: {
        type: String,
        trim: true,
        maxlength: 150,
        default: "",
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

/*
 * Supports recent activity queries for one user.
 */
activitySchema.index({
  user: 1,
  createdAt: -1,
});

/*
 * Supports global recent-activity views such as
 * an administrator dashboard.
 */
activitySchema.index({
  createdAt: -1,
});

module.exports =
  mongoose.models.Activity ||
  mongoose.model(
    "Activity",
    activitySchema
  );