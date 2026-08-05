const express = require("express");
const {
  body,
} = require("express-validator");

const {
  getProfile,
  updateProfile,
} = require("../controllers/userController");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const validate = require(
  "../middleware/validationMiddleware"
);

const router = express.Router();

const ALLOWED_PROFILE_FIELDS = [
  "username",
  "email",
  "bio",
  "avatar",
  "theme",
];

/**
 * Ensures the request contains at least one supported
 * profile field.
 *
 * @param {object} value
 * @returns {boolean}
 */
function validateProfileFields(value) {
  const hasSupportedField =
    ALLOWED_PROFILE_FIELDS.some(
      (field) =>
        Object.prototype.hasOwnProperty.call(
          value,
          field
        )
    );

  if (!hasSupportedField) {
    throw new Error(
      "Provide at least one profile field to update."
    );
  }

  return true;
}

/*
 * Every user route requires authentication.
 */
router.use(authMiddleware);

/*
 * Returns the authenticated user's profile.
 */
router.get(
  "/profile",
  getProfile
);

/*
 * Updates supported profile fields.
 */
router.put(
  "/profile",
  [
    body().custom(
      validateProfileFields
    ),

    body("username")
      .optional()
      .isString()
      .withMessage(
        "Username must be text."
      )
      .bail()
      .trim()
      .isLength({
        min: 3,
        max: 50,
      })
      .withMessage(
        "Username must be between 3 and 50 characters."
      ),

    body("email")
      .optional()
      .isString()
      .withMessage(
        "Email must be text."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Email cannot be empty."
      )
      .bail()
      .isEmail()
      .withMessage(
        "Please enter a valid email address."
      )
      .bail()
      .isLength({
        max: 254,
      })
      .withMessage(
        "Email cannot exceed 254 characters."
      )
      .normalizeEmail(),

    body("bio")
      .optional()
      .isString()
      .withMessage(
        "Bio must be text."
      )
      .bail()
      .trim()
      .isLength({
        max: 1000,
      })
      .withMessage(
        "Bio cannot exceed 1000 characters."
      ),

    body("avatar")
      .optional()
      .isString()
      .withMessage(
        "Avatar must be text."
      )
      .bail()
      .trim()
      .isLength({
        max: 2048,
      })
      .withMessage(
        "Avatar cannot exceed 2048 characters."
      ),

    body("theme")
      .optional()
      .isString()
      .withMessage(
        "Theme must be text."
      )
      .bail()
      .trim()
      .toLowerCase()
      .isIn([
        "light",
        "dark",
      ])
      .withMessage(
        "Theme must be light or dark."
      ),
  ],
  validate,
  updateProfile
);

module.exports = router;