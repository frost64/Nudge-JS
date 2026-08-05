const User = require("../models/User");

const ALLOWED_THEMES = new Set([
  "light",
  "dark",
]);

/**
 * Sends a consistent server-error response.
 *
 * @param {import("express").Response} res
 * @param {Error} error
 * @param {string} fallbackMessage
 * @returns {import("express").Response}
 */
function sendServerError(
  res,
  error,
  fallbackMessage = "Internal server error."
) {
  console.error(error);

  if (error?.name === "ValidationError") {
    const validationMessage = Object.values(
      error.errors
    )
      .map((item) => item.message)
      .join(" ");

    return res.status(400).json({
      success: false,
      message:
        validationMessage ||
        "Profile validation failed.",
    });
  }

  if (error?.code === 11000) {
    const duplicateField =
      Object.keys(
        error.keyPattern ||
          error.keyValue ||
          {}
      )[0] || "value";

    return res.status(409).json({
      success: false,
      message:
        duplicateField === "email"
          ? "Email already in use."
          : duplicateField === "username"
            ? "Username already taken."
            : "Profile information already exists.",
    });
  }

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? fallbackMessage
        : error.message ||
          fallbackMessage,
  });
}

/**
 * Removes sensitive fields before returning a user.
 *
 * @param {object} user
 * @returns {object|null}
 */
function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const safeUser =
    typeof user.toObject === "function"
      ? user.toObject()
      : { ...user };

  delete safeUser.password;
  delete safeUser.passwordResetToken;
  delete safeUser.passwordResetExpires;
  delete safeUser.__v;

  return safeUser;
}

/**
 * Normalizes an email address.
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeEmail(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

/**
 * Normalizes a username.
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeUsername(value) {
  return String(value ?? "").trim();
}

/**
 * Performs basic email-format validation.
 *
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

/**
 * Returns the authenticated user's profile.
 */
async function getProfile(req, res) {
  try {
    const user = await User.findById(
      req.user.id
    ).select(
      "-password -passwordResetToken -passwordResetExpires -__v"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json(
      sanitizeUser(user)
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to load profile."
    );
  }
}

/**
 * Updates supported profile fields for the authenticated user.
 */
async function updateProfile(req, res) {
  try {
    const {
      username,
      email,
      bio,
      avatar,
      theme,
    } = req.body;

    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (username !== undefined) {
      const normalizedUsername =
        normalizeUsername(username);

      if (!normalizedUsername) {
        return res.status(400).json({
          success: false,
          message:
            "Username cannot be empty.",
        });
      }

      if (
        normalizedUsername !==
        user.username
      ) {
        const usernameExists =
          await User.exists({
            username:
              normalizedUsername,

            _id: {
              $ne: user._id,
            },
          });

        if (usernameExists) {
          return res.status(409).json({
            success: false,
            message:
              "Username already taken.",
          });
        }
      }

      user.username =
        normalizedUsername;
    }

    if (email !== undefined) {
      const normalizedEmail =
        normalizeEmail(email);

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message:
            "Email cannot be empty.",
        });
      }

      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid email address.",
        });
      }

      if (
        normalizedEmail !== user.email
      ) {
        const emailExists =
          await User.exists({
            email: normalizedEmail,

            _id: {
              $ne: user._id,
            },
          });

        if (emailExists) {
          return res.status(409).json({
            success: false,
            message:
              "Email already in use.",
          });
        }
      }

      user.email = normalizedEmail;
    }

    if (bio !== undefined) {
      user.bio = String(bio).trim();
    }

    if (avatar !== undefined) {
      user.avatar = String(
        avatar
      ).trim();
    }

    if (theme !== undefined) {
      const normalizedTheme = String(
        theme
      )
        .trim()
        .toLowerCase();

      if (
        !ALLOWED_THEMES.has(
          normalizedTheme
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Theme must be light or dark.",
        });
      }

      user.theme = normalizedTheme;
    }

    await user.save();

    return res.status(200).json(
      sanitizeUser(user)
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to update profile."
    );
  }
}

module.exports = {
  getProfile,
  updateProfile,
};