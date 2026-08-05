const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const express = require("express");
const {
  body,
  param,
} = require("express-validator");
const multer = require("multer");

const {
  deleteMyAccount,
  forgotPassword,
  getMe,
  googleLogin,
  loginUser,
  resetPassword,
  sendRegistrationOTP,
  updateEmail,
  updateFullName,
  updatePassword,
  updateProfile,
  updateUsername,
  uploadProfilePicture,
  verifyRegistrationOTP,
} = require("../controllers/authController");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const validate = require(
  "../middleware/validationMiddleware"
);

const router = express.Router();

const AVATAR_UPLOAD_DIRECTORY =
  path.resolve(
    __dirname,
    "..",
    "uploads",
    "avatars"
  );

const DEFAULT_MAX_AVATAR_SIZE =
  5 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES =
  Object.freeze({
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
  });

/**
 * Converts an environment value into a positive integer.
 *
 * @param {unknown} value
 * @param {number} fallback
 * @returns {number}
 */
function parsePositiveInteger(
  value,
  fallback
) {
  const parsedValue = Number.parseInt(
    value,
    10
  );

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 1
  ) {
    return fallback;
  }

  return parsedValue;
}

const maxAvatarSize =
  parsePositiveInteger(
    process.env
      .MAX_AVATAR_UPLOAD_SIZE_BYTES,
    DEFAULT_MAX_AVATAR_SIZE
  );

/**
 * Validates that a password meets the application policy
 * and does not exceed bcrypt's safe input length.
 *
 * @param {string} field
 * @param {string} label
 * @returns {import("express-validator").ValidationChain}
 */
function passwordRule(
  field,
  label = "Password"
) {
  return body(field)
    .isString()
    .withMessage(
      `${label} is required.`
    )
    .bail()
    .notEmpty()
    .withMessage(
      `${label} is required.`
    )
    .bail()
    .isLength({
      min: 6,
    })
    .withMessage(
      `${label} must be at least 6 characters.`
    )
    .bail()
    .custom((value) => {
      if (
        Buffer.byteLength(
          value,
          "utf8"
        ) > 72
      ) {
        throw new Error(
          `${label} cannot exceed 72 bytes.`
        );
      }

      return true;
    });
}

/**
 * Creates the upload directory when needed.
 */
function avatarDestination(
  req,
  file,
  callback
) {
  fs.mkdir(
    AVATAR_UPLOAD_DIRECTORY,
    {
      recursive: true,
    },
    (error) => {
      callback(
        error,
        AVATAR_UPLOAD_DIRECTORY
      );
    }
  );
}

/**
 * Generates a collision-resistant avatar filename.
 */
function avatarFilename(
  req,
  file,
  callback
) {
  const extension =
    ALLOWED_AVATAR_TYPES[
      file.mimetype
    ];

  if (!extension) {
    return callback(
      new Error(
        "Unsupported image type."
      )
    );
  }

  const userId = String(
    req.user?._id ||
      req.user?.id ||
      "user"
  ).replace(
    /[^a-zA-Z0-9_-]/g,
    ""
  );

  const randomValue = crypto
    .randomBytes(8)
    .toString("hex");

  const filename =
    `${userId}-${Date.now()}-` +
    `${randomValue}${extension}`;

  return callback(null, filename);
}

const avatarStorage =
  multer.diskStorage({
    destination:
      avatarDestination,

    filename:
      avatarFilename,
  });

const avatarUpload = multer({
  storage: avatarStorage,

  limits: {
    files: 1,
    fileSize: maxAvatarSize,
  },

  fileFilter(
    req,
    file,
    callback
  ) {
    if (
      ALLOWED_AVATAR_TYPES[
        file.mimetype
      ]
    ) {
      return callback(
        null,
        true
      );
    }

    return callback(
      new Error(
        "Only JPEG, PNG, WebP, GIF, and AVIF images are allowed."
      )
    );
  },
});

/**
 * Handles Multer errors with consistent API responses.
 */
function uploadAvatarMiddleware(
  req,
  res,
  next
) {
  avatarUpload.single("image")(
    req,
    res,
    (error) => {
      if (!error) {
        return next();
      }

      if (
        error instanceof
        multer.MulterError
      ) {
        if (
          error.code ===
          "LIMIT_FILE_SIZE"
        ) {
          return res.status(413).json({
            success: false,
            message:
              `Profile picture cannot exceed ` +
              `${Math.ceil(
                maxAvatarSize /
                  (1024 * 1024)
              )} MB.`,
          });
        }

        if (
          error.code ===
          "LIMIT_FILE_COUNT" ||
          error.code ===
          "LIMIT_UNEXPECTED_FILE"
        ) {
          return res.status(400).json({
            success: false,
            message:
              'Upload exactly one image using the field name "image".',
          });
        }

        return res.status(400).json({
          success: false,
          message:
            error.message ||
            "Profile picture upload failed.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Invalid profile picture.",
      });
    }
  );
}

/*
 * Public authentication routes.
 */
router.post(
  "/login",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage(
        "Email is required."
      )
      .bail()
      .isEmail()
      .withMessage(
        "Please enter a valid email address."
      ),

    body("password")
      .isString()
      .withMessage(
        "Password is required."
      )
      .bail()
      .notEmpty()
      .withMessage(
        "Password is required."
      ),
  ],
  validate,
  loginUser
);

router.post(
  "/google",
  [
    body("credential")
      .isString()
      .withMessage(
        "Google credential is required."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Google credential is required."
      )
      .bail()
      .isLength({
        max: 10_000,
      })
      .withMessage(
        "Google credential is invalid."
      ),
  ],
  validate,
  googleLogin
);

router.post(
  "/forgot-password",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage(
        "Email is required."
      )
      .bail()
      .isEmail()
      .withMessage(
        "Please enter a valid email address."
      ),
  ],
  validate,
  forgotPassword
);

router.put(
  "/reset-password/:token",
  [
    param("token")
      .trim()
      .matches(
        /^[a-fA-F0-9]{64}$/
      )
      .withMessage(
        "Reset token is invalid."
      ),

    passwordRule(
      "password"
    ),
  ],
  validate,
  resetPassword
);

/*
 * Registration and OTP verification.
 */
router.post(
  "/register/send-otp",
  [
    body("fullName")
      .isString()
      .withMessage(
        "Full name is required."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Full name is required."
      )
      .bail()
      .isLength({
        max: 120,
      })
      .withMessage(
        "Full name cannot exceed 120 characters."
      ),

    body("username")
      .isString()
      .withMessage(
        "Username is required."
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
      .trim()
      .notEmpty()
      .withMessage(
        "Email is required."
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
      ),

    passwordRule(
      "password"
    ),
  ],
  validate,
  sendRegistrationOTP
);

router.post(
  "/register/verify",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage(
        "Email is required."
      )
      .bail()
      .isEmail()
      .withMessage(
        "Please enter a valid email address."
      ),

    body("otp")
      .isString()
      .withMessage(
        "Verification code is required."
      )
      .bail()
      .trim()
      .matches(/^\d{6}$/)
      .withMessage(
        "Verification code must contain 6 digits."
      ),
  ],
  validate,
  verifyRegistrationOTP
);

/*
 * Authenticated profile routes.
 */
router.get(
  "/me",
  authMiddleware,
  getMe
);

router.put(
  "/profile",
  authMiddleware,
  [
    body("fullName")
      .optional()
      .isString()
      .withMessage(
        "Full name must be text."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Full name cannot be empty."
      )
      .bail()
      .isLength({
        max: 120,
      })
      .withMessage(
        "Full name cannot exceed 120 characters."
      ),

    body("bio")
      .optional()
      .isString()
      .withMessage(
        "Bio must be text."
      )
      .bail()
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
      .isLength({
        max: 2048,
      })
      .withMessage(
        "Avatar cannot exceed 2048 characters."
      ),

    body("theme")
      .optional()
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

router.put(
  "/fullname",
  authMiddleware,
  [
    body("fullName")
      .isString()
      .withMessage(
        "Full name is required."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Full name is required."
      )
      .bail()
      .isLength({
        max: 120,
      })
      .withMessage(
        "Full name cannot exceed 120 characters."
      ),
  ],
  validate,
  updateFullName
);

router.put(
  "/username",
  authMiddleware,
  [
    body("username")
      .isString()
      .withMessage(
        "Username is required."
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
  ],
  validate,
  updateUsername
);

router.put(
  "/email",
  authMiddleware,
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage(
        "Email is required."
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
      ),
  ],
  validate,
  updateEmail
);

router.put(
  "/password",
  authMiddleware,
  [
    body("currentPassword")
      .isString()
      .withMessage(
        "Current password is required."
      )
      .bail()
      .notEmpty()
      .withMessage(
        "Current password is required."
      ),

    passwordRule(
      "newPassword",
      "New password"
    ),

    body("confirmPassword")
      .isString()
      .withMessage(
        "Password confirmation is required."
      )
      .bail()
      .notEmpty()
      .withMessage(
        "Password confirmation is required."
      )
      .bail()
      .custom(
        (
          confirmPassword,
          { req }
        ) => {
          if (
            confirmPassword !==
            req.body.newPassword
          ) {
            throw new Error(
              "Passwords do not match."
            );
          }

          return true;
        }
      ),
  ],
  validate,
  updatePassword
);

router.put(
  "/profile-picture",
  authMiddleware,
  uploadAvatarMiddleware,
  uploadProfilePicture
);

router.delete(
  "/delete-account",
  authMiddleware,
  deleteMyAccount
);

module.exports = router;