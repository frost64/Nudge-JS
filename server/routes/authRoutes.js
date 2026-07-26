const express = require("express");
const router = express.Router();
const multer = require("multer");

const authMiddleware = require("../middleware/authMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/avatars"));
  },
  filename: (req, file, cb) => {
    const uniqueName =
      `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  updateFullName,
  updateUsername,
  updateEmail,
  updatePassword,
  googleLogin,
  deleteMyAccount,
  uploadProfilePicture,
  forgotPassword,
  resetPassword,
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

router.post(
  "/google",
  googleLogin
);


router.post(
  "/forgot-password",
  forgotPassword
);

router.put(
  "/reset-password/:token",
  resetPassword
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
router.put(
  "/fullname",
  authMiddleware,
  updateFullName
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

router.put(
  "/profile-picture",
  authMiddleware,
  upload.single("image"),
  uploadProfilePicture
);


module.exports = router;