const express = require("express");
const {
  query,
} = require("express-validator");

const {
  getSuggestions,
  globalSearch,
} = require("../controllers/searchController");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const validate = require(
  "../middleware/validationMiddleware"
);

const router = express.Router();

const MAX_SEARCH_QUERY_LENGTH = 100;

/**
 * Every search route requires authentication.
 */
router.use(authMiddleware);

/**
 * Returns lightweight autocomplete suggestions.
 *
 * An absent query or a query shorter than two characters
 * returns an empty array from the controller.
 */
router.get(
  "/suggestions",
  [
    query("q")
      .optional({
        nullable: true,
      })
      .isString()
      .withMessage(
        "Search query must be text."
      )
      .bail()
      .trim()
      .isLength({
        max: MAX_SEARCH_QUERY_LENGTH,
      })
      .withMessage(
        `Search query cannot exceed ${MAX_SEARCH_QUERY_LENGTH} characters.`
      ),
  ],
  validate,
  getSuggestions
);

/**
 * Searches reminders, birthdays, notes, and links
 * belonging to the authenticated user.
 */
router.get(
  "/",
  [
    query("q")
      .isString()
      .withMessage(
        "Search query is required."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Search query is required."
      )
      .bail()
      .isLength({
        max: MAX_SEARCH_QUERY_LENGTH,
      })
      .withMessage(
        `Search query cannot exceed ${MAX_SEARCH_QUERY_LENGTH} characters.`
      ),
  ],
  validate,
  globalSearch
);

module.exports = router;