const express = require("express");
const {
  body,
  param,
  query,
} = require("express-validator");

const {
  createLink,
  deleteLink,
  getLinks,
  toggleFavoriteLink,
  updateLink,
} = require("../controllers/linkController");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const validate = require(
  "../middleware/validationMiddleware"
);

const router = express.Router();

const ALLOWED_URL_PROTOCOLS = new Set([
  "http:",
  "https:",
]);

/*
 * Checks that a URL is absolute and uses HTTP or HTTPS.
 */
function validateUrl(value) {
  try {
    const parsedUrl = new URL(value);

    if (
      !ALLOWED_URL_PROTOCOLS.has(
        parsedUrl.protocol
      )
    ) {
      throw new Error(
        "URL must use HTTP or HTTPS."
      );
    }

    return true;
  } catch (error) {
    throw new Error(
      error.message ===
        "URL must use HTTP or HTTPS."
        ? error.message
        : "Please enter a valid URL."
    );
  }
}

/*
 * Validation shared by link creation and update routes.
 */
function linkValidationRules() {
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

    body("url")
      .isString()
      .withMessage(
        "URL must be text."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "URL is required."
      )
      .bail()
      .isLength({
        max: 2048,
      })
      .withMessage(
        "URL cannot exceed 2048 characters."
      )
      .bail()
      .custom(validateUrl),

    body("category")
      .isString()
      .withMessage(
        "Category must be text."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Category is required."
      )
      .bail()
      .isLength({
        max: 100,
      })
      .withMessage(
        "Category cannot exceed 100 characters."
      ),

    body("notes")
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
        max: 3000,
      })
      .withMessage(
        "Description cannot exceed 3000 characters."
      ),
  ];
}

/*
 * All link routes require authentication.
 */
router.use(authMiddleware);

/*
 * Returns the authenticated user's paginated links.
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
  getLinks
);

/*
 * Creates a new link.
 */
router.post(
  "/",
  linkValidationRules(),
  validate,
  createLink
);

/*
 * Updates an existing link.
 */
router.put(
  "/:id",
  [
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid link ID."
      ),

    ...linkValidationRules(),
  ],
  validate,
  updateLink
);

/*
 * Toggles a link's favorite status.
 */
router.patch(
  "/:id/favorite",
  [
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid link ID."
      ),
  ],
  validate,
  toggleFavoriteLink
);

/*
 * Deletes an existing link.
 */
router.delete(
  "/:id",
  [
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid link ID."
      ),
  ],
  validate,
  deleteLink
);

module.exports = router;