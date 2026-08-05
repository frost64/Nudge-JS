const express = require("express");
const {
  body,
  param,
  query,
} = require("express-validator");

const {
  createNote,
  deleteNote,
  getNotes,
  toggleFavoriteNote,
  togglePinNote,
  updateNote,
} = require("../controllers/noteController");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const validate = require(
  "../middleware/validationMiddleware"
);

const router = express.Router();

const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;

/**
 * Normalizes tags, removes empty entries, and removes
 * case-insensitive duplicates while preserving order.
 *
 * @param {unknown} value
 * @returns {string[]}
 */
function normalizeTags(value) {
  if (!Array.isArray(value)) {
    return value;
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

/**
 * Returns validation rules shared by note creation
 * and update routes.
 *
 * @returns {import("express-validator").ValidationChain[]}
 */
function noteValidationRules() {
  return [
    body("title")
      .isString()
      .withMessage(
        "Title must be text."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Title is required."
      )
      .bail()
      .isLength({
        max: 200,
      })
      .withMessage(
        "Title cannot exceed 200 characters."
      ),

    body("content")
      .isString()
      .withMessage(
        "Description must be text."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Description is required."
      )
      .bail()
      .isLength({
        max: 20_000,
      })
      .withMessage(
        "Description cannot exceed 20000 characters."
      ),

    body("tags")
      .isArray({
        min: 1,
        max: MAX_TAGS,
      })
      .withMessage(
        `Please add between 1 and ${MAX_TAGS} tags.`
      )
      .bail()
      .customSanitizer(normalizeTags)
      .custom((tags) => {
        if (tags.length === 0) {
          throw new Error(
            "Please add at least one tag."
          );
        }

        if (tags.length > MAX_TAGS) {
          throw new Error(
            `A note cannot have more than ${MAX_TAGS} tags.`
          );
        }

        return true;
      }),

    body("tags.*")
      .isString()
      .withMessage(
        "Each tag must be text."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Tags cannot be empty."
      )
      .bail()
      .isLength({
        max: MAX_TAG_LENGTH,
      })
      .withMessage(
        `Each tag cannot exceed ${MAX_TAG_LENGTH} characters.`
      ),
  ];
}

/*
 * Every note route requires authentication.
 */
router.use(authMiddleware);

/*
 * Returns the authenticated user's paginated notes.
 */
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({
        min: 1,
      })
      .withMessage(
        "Page must be a positive integer."
      )
      .toInt(),

    query("limit")
      .optional()
      .isInt({
        min: 1,
        max: 100,
      })
      .withMessage(
        "Limit must be between 1 and 100."
      )
      .toInt(),
  ],
  validate,
  getNotes
);

/*
 * Creates a note.
 */
router.post(
  "/",
  noteValidationRules(),
  validate,
  createNote
);

/*
 * Updates a note.
 */
router.put(
  "/:id",
  [
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid note ID."
      ),

    ...noteValidationRules(),
  ],
  validate,
  updateNote
);

/*
 * Toggles a note's pinned state.
 */
router.patch(
  "/:id/pin",
  [
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid note ID."
      ),
  ],
  validate,
  togglePinNote
);

/*
 * Toggles a note's favorite state.
 */
router.patch(
  "/:id/favorite",
  [
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid note ID."
      ),
  ],
  validate,
  toggleFavoriteNote
);

/*
 * Deletes a note.
 */
router.delete(
  "/:id",
  [
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid note ID."
      ),
  ],
  validate,
  deleteNote
);

module.exports = router;