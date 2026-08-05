const mongoose = require("mongoose");

const ALLOWED_URL_PROTOCOLS = new Set([
  "http:",
  "https:",
]);

/**
 * Validates that a URL is absolute and uses HTTP or HTTPS.
 *
 * @param {string} value
 * @returns {boolean}
 */
function isValidUrl(value) {
  try {
    const parsedUrl = new URL(value);

    return ALLOWED_URL_PROTOCOLS.has(
      parsedUrl.protocol
    );
  } catch {
    return false;
  }
}

const linkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [
        true,
        "Title is required.",
      ],
      trim: true,
      minlength: [
        1,
        "Title is required.",
      ],
      maxlength: [
        200,
        "Title cannot exceed 200 characters.",
      ],
    },

    url: {
      type: String,
      required: [
        true,
        "URL is required.",
      ],
      trim: true,
      maxlength: [
        2048,
        "URL cannot exceed 2048 characters.",
      ],
      validate: {
        validator: isValidUrl,
        message:
          "Please enter a valid HTTP or HTTPS URL.",
      },
    },

    category: {
      type: String,
      required: [
        true,
        "Category is required.",
      ],
      trim: true,
      default: "General",
      minlength: [
        1,
        "Category is required.",
      ],
      maxlength: [
        100,
        "Category cannot exceed 100 characters.",
      ],
    },

    notes: {
      type: String,
      required: [
        true,
        "Description is required.",
      ],
      trim: true,
      minlength: [
        1,
        "Description is required.",
      ],
      maxlength: [
        3000,
        "Description cannot exceed 3000 characters.",
      ],
    },

    favorite: {
      type: Boolean,
      default: false,
    },

    user: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [
        true,
        "User is required.",
      ],
    },

    clickCount: {
      type: Number,
      default: 0,
      min: [
        0,
        "Click count cannot be negative.",
      ],
      validate: {
        validator: Number.isInteger,
        message:
          "Click count must be a whole number.",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/*
 * Supports paginated link lists ordered by creation date.
 */
linkSchema.index({
  user: 1,
  createdAt: -1,
});

/*
 * Supports favorite-link queries used by the dashboard
 * and links sidebar.
 */
linkSchema.index({
  user: 1,
  favorite: 1,
  updatedAt: -1,
});

/*
 * Supports category-based filtering and autocomplete.
 */
linkSchema.index({
  user: 1,
  category: 1,
});

module.exports =
  mongoose.models.Link ||
  mongoose.model(
    "Link",
    linkSchema
  );