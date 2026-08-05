const express = require("express");
const {
  body,
} = require("express-validator");

const {
  createSuggestion,
  getMySuggestions,
} = require("../controllers/suggestionController");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const validate = require(
  "../middleware/validationMiddleware"
);

const router = express.Router();

/**
 * Returns validation rules for creating a suggestion.
 *
 * @returns {import("express-validator").ValidationChain[]}
 */
function suggestionValidationRules() {
  return [
    body("title")
      .isString()
      .withMessage(
        "Suggestion title must be text."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Suggestion title is required."
      )
      .bail()
      .isLength({
        max: 200,
      })
      .withMessage(
        "Suggestion title cannot exceed 200 characters."
      ),

    body("message")
      .isString()
      .withMessage(
        "Suggestion message must be text."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Suggestion message is required."
      )
      .bail()
      .isLength({
        max: 5000,
      })
      .withMessage(
        "Suggestion message cannot exceed 5000 characters."
      ),
  ];
}

/*
 * Every suggestion route requires authentication.
 */
router.use(authMiddleware);

/*
 * Creates a suggestion for the authenticated user.
 */
router.post(
  "/",
  suggestionValidationRules(),
  validate,
  createSuggestion
);

/*
 * Returns suggestions submitted by the authenticated user.
 */
router.get(
  "/mine",
  getMySuggestions
);

module.exports = router;