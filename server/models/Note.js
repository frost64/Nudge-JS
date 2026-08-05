const mongoose = require("mongoose");

const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;

/**
 * Normalizes tags, removes empty values, and removes
 * case-insensitive duplicates while preserving order.
 *
 * @param {unknown} value
 * @returns {string[]}
 */
function normalizeTags(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenTags = new Set();
  const normalizedTags = [];

  for (const tag of value) {
    const normalizedTag = String(
      tag ?? ""
    ).trim();

    if (!normalizedTag) {
      continue;
    }

    const comparisonValue =
      normalizedTag.toLowerCase();

    if (seenTags.has(comparisonValue)) {
      continue;
    }

    seenTags.add(comparisonValue);
    normalizedTags.push(normalizedTag);
  }

  return normalizedTags;
}

const noteSchema = new mongoose.Schema(
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

    content: {
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
        20_000,
        "Description cannot exceed 20000 characters.",
      ],
    },

    tags: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [
            MAX_TAG_LENGTH,
            `Each tag cannot exceed ${MAX_TAG_LENGTH} characters.`,
          ],
        },
      ],

      default: [],

      set: normalizeTags,

      validate: [
        {
          validator(value) {
            return (
              Array.isArray(value) &&
              value.length > 0
            );
          },

          message:
            "Please add at least one tag.",
        },

        {
          validator(value) {
            return (
              Array.isArray(value) &&
              value.length <= MAX_TAGS
            );
          },

          message:
            `A note cannot have more than ${MAX_TAGS} tags.`,
        },
      ],
    },

    pinned: {
      type: Boolean,
      default: false,
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

    lastViewed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/*
 * Supports paginated note lists with pinned notes first.
 */
noteSchema.index({
  user: 1,
  pinned: -1,
  createdAt: -1,
});

/*
 * Supports favorite-note queries.
 */
noteSchema.index({
  user: 1,
  favorite: 1,
  createdAt: -1,
});

/*
 * Supports tag filtering and tag suggestion queries.
 */
noteSchema.index({
  user: 1,
  tags: 1,
});

/*
 * Supports recently viewed note queries.
 */
noteSchema.index({
  user: 1,
  lastViewed: -1,
});

module.exports =
  mongoose.models.Note ||
  mongoose.model(
    "Note",
    noteSchema
  );