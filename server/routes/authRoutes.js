const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  updateUsername,
  updateEmail,
  updatePassword,
  deleteMyAccount,
} = require("../controllers/authController");

// =======================
// Register
// =======================

router.post(
  "/register",
  [
    body("username")
      .notEmpty()
      .withMessage("Username is required"),

    body("email")
      .isEmail()
      .withMessage("Invalid email"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  registerUser
);

// =======================
// Login
// =======================

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Invalid email"),

    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  validate,
  loginUser
);

// =======================
// Profile
// =======================

router.get(
  "/me",
  authMiddleware,
  getMe
);

// Avatar + Bio only
router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

// Username only
router.put(
  "/username",
  authMiddleware,
  updateUsername
);

// Email only
router.put(
  "/email",
  authMiddleware,
  updateEmail
);

// Password only
router.put(
  "/password",
  authMiddleware,
  updatePassword
);

// Delete account
router.delete(
  "/delete-account",
  authMiddleware,
  deleteMyAccount
);

module.exports = router;