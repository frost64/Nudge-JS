const mongoose = require("mongoose");

const SUGGESTION_STATUSES = [
  "new",
  "read",
];

const suggestionSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: [
          true,
          "User is required.",
        ],
      },

      /*
       * Stores the user's name at the time the
       * suggestion was submitted.
       */
      fullName: {
        type: String,
        required: [
          true,
          "Full name is required.",
        ],
        trim: true,
        minlength: [
          1,
          "Full name is required.",
        ],
        maxlength: [
          120,
          "Full name cannot exceed 120 characters.",
        ],
      },

      /*
       * Stores the username at the time the
       * suggestion was submitted.
       */
      username: {
        type: String,
        required: [
          true,
          "Username is required.",
        ],
        trim: true,
        minlength: [
          1,
          "Username is required.",
        ],
        maxlength: [
          50,
          "Username cannot exceed 50 characters.",
        ],
      },

      title: {
        type: String,
        required: [
          true,
          "Suggestion title is required.",
        ],
        trim: true,
        minlength: [
          1,
          "Suggestion title is required.",
        ],
        maxlength: [
          200,
          "Suggestion title cannot exceed 200 characters.",
        ],
      },

      message: {
        type: String,
        required: [
          true,
          "Suggestion message is required.",
        ],
        trim: true,
        minlength: [
          1,
          "Suggestion message is required.",
        ],
        maxlength: [
          5000,
          "Suggestion message cannot exceed 5000 characters.",
        ],
      },

      status: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        enum: {
          values:
            SUGGESTION_STATUSES,
          message:
            "Suggestion status must be new or read.",
        },
        default: "new",
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

/*
 * Supports each user's suggestion history,
 * ordered from newest to oldest.
 */
suggestionSchema.index({
  user: 1,
  createdAt: -1,
});

/*
 * Supports the administrator suggestion list.
 */
suggestionSchema.index({
  createdAt: -1,
});

/*
 * Supports filtering unread and read suggestions.
 */
suggestionSchema.index({
  status: 1,
  createdAt: -1,
});

module.exports =
  mongoose.models.Suggestion ||
  mongoose.model(
    "Suggestion",
    suggestionSchema
  );