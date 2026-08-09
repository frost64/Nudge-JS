const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const transporter = require("../config/mailer");

const Birthday = require("../models/Birthday");
const EmailVerification = require("../models/EmailVerification");
const Link = require("../models/Link");
const Note = require("../models/Note");
const Reminder = require("../models/Reminder");
const User = require("../models/User");

const logActivity = require("../utils/activityLogger");
const {
  compareOTP,
  generateOTP,
  getOTPExpiry,
  hashOTP,
} = require("../utils/otp");

const BCRYPT_SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = "7d";
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_RESET_DURATION_MS =
  60 * 60 * 1000;

const GENERIC_RESET_MESSAGE =
  "If an account exists with that email, a reset link has been sent.";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

/**
 * Creates a signed JWT for an authenticated user.
 *
 * @param {object} user
 * @returns {string}
 */
function createAuthToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured."
    );
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
}

/**
 * Returns the public user object used by the frontend.
 *
 * @param {object} user
 * @returns {object}
 */
function serializeUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    theme: user.theme,
    createdAt: user.createdAt,
  };
}

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

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? fallbackMessage
        : error.message || fallbackMessage,
  });
}

/**
 * Records activity without allowing logging failures
 * to interrupt the primary request.
 *
 * @param {object} event
 * @returns {Promise<void>}
 */
async function safelyLogActivity(event) {
  try {
    await logActivity(event);
  } catch (error) {
    console.error(
      "Failed to write activity log:",
      error
    );
  }
}

/**
 * Escapes dynamic values inserted into email HTML.
 *
 * @param {unknown} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
 * Checks whether a password satisfies the minimum policy.
 *
 * @param {unknown} password
 * @returns {boolean}
 */
function isValidPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= PASSWORD_MIN_LENGTH
  );
}

/**
 * Removes a locally uploaded avatar without blocking
 * the Node.js event loop.
 *
 * @param {string} avatarPath
 * @returns {Promise<void>}
 */
async function removeUploadedAvatar(
  avatarPath
) {
  if (
    !avatarPath ||
    !avatarPath.startsWith(
      "/uploads/avatars/"
    )
  ) {
    return;
  }

  const relativePath = avatarPath.replace(
    /^[/\\]+/,
    ""
  );

  const absolutePath = path.resolve(
    __dirname,
    "..",
    relativePath
  );

  const avatarDirectory = path.resolve(
    __dirname,
    "..",
    "uploads",
    "avatars"
  );

  const isInsideAvatarDirectory =
    absolutePath === avatarDirectory ||
    absolutePath.startsWith(
      `${avatarDirectory}${path.sep}`
    );

  if (!isInsideAvatarDirectory) {
    console.warn(
      "Skipped unsafe avatar deletion path:",
      absolutePath
    );

    return;
  }

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(
        "Failed to delete avatar file:",
        error
      );
    }
  }
}

/**
 * Creates a unique username for a new Google user.
 *
 * @param {string} email
 * @returns {Promise<string>}
 */
async function createUniqueGoogleUsername(
  email
) {
  const rawBase =
    email.split("@")[0] || "user";

  const base =
    rawBase
      .replace(
        /[^a-zA-Z0-9_-]/g,
        ""
      )
      .slice(0, 24) || "user";

  for (
    let attempt = 0;
    attempt < 10;
    attempt += 1
  ) {
    const suffix = crypto
      .randomInt(1000, 100000)
      .toString();

    const candidate =
      `${base}${suffix}`.slice(0, 30);

    const exists = await User.exists({
      username: candidate,
    });

    if (!exists) {
      return candidate;
    }
  }

  return `user${Date.now()}`.slice(
    0,
    30
  );
}

/**
 * Authenticates a user with email and password.
 */
async function loginUser(req, res) {
  try {
    const email = normalizeEmail(
      req.body.email
    );

    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const token = createAuthToken(user);

    await safelyLogActivity({
      type: "user_login",
      message:
        `${user.username} logged in`,
      user: user._id,
    });

    return res.status(200).json({
      success: true,
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to log in."
    );
  }
}

/**
 * Creates or replaces a pending registration
 * verification request.
 */
async function sendRegistrationOTP(
  req,
  res
) {
  try {
    const fullName = String(
      req.body.fullName ?? ""
    ).trim();

    const username = normalizeUsername(
      req.body.username
    );

    const email = normalizeEmail(
      req.body.email
    );

    const { password } = req.body;

    if (
      !fullName ||
      !username ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all required fields.",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters.",
      });
    }

    const [
      existingEmail,
      existingUsername,
    ] = await Promise.all([
      User.exists({
        email,
      }),
      User.exists({
        username,
      }),
    ]);

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Email already registered.",
      });
    }

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message:
          "Username already taken.",
      });
    }

    const otp = generateOTP();

    const [
      hashedOTP,
      hashedPassword,
    ] = await Promise.all([
      hashOTP(otp),

      bcrypt.hash(
        password,
        BCRYPT_SALT_ROUNDS
      ),
    ]);

    await EmailVerification.findOneAndUpdate(
      {
        email,
      },
      {
        fullName,
        username,
        email,
        password: hashedPassword,
        otp: hashedOTP,
        expiresAt: getOTPExpiry(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    try {
      await transporter.sendMail({
        from:
          process.env.EMAIL_FROM ||
          "Nudge <onboarding@resend.dev>",
        to: email,
        subject:
          "Verify your Nudge account",
        html: `
          <h2>Email Verification</h2>

          <p>
            Hello ${escapeHtml(fullName)},
          </p>

          <p>
            Your verification code is:
          </p>

          <h1
            style="
              letter-spacing: 8px;
              color: #0ea5e9;
            "
          >
            ${escapeHtml(otp)}
          </h1>

          <p>
            This code expires in
            <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not create this
            account, please ignore this email.
          </p>
        `,
      });
    } catch (mailError) {
      await EmailVerification.deleteOne({
        email,
      });

      throw mailError;
    }

    return res.status(200).json({
      success: true,
      message:
        "Verification code sent.",
      email,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to send verification code."
    );
  }
}

/**
 * Verifies a registration OTP and creates
 * the corresponding user account.
 */
async function verifyRegistrationOTP(
  req,
  res
) {
  try {
    const email = normalizeEmail(
      req.body.email
    );

    const otp = String(
      req.body.otp ?? ""
    ).trim();

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required.",
      });
    }

    const verification =
      await EmailVerification.findOne({
        email,
      });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired or is invalid.",
      });
    }

    const expirationTime = new Date(
      verification.expiresAt
    ).getTime();

    if (expirationTime <= Date.now()) {
      await verification.deleteOne();

      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    const validOTP = await compareOTP(
      otp,
      verification.otp
    );

    if (!validOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    const [
      existingEmail,
      existingUsername,
    ] = await Promise.all([
      User.exists({
        email: verification.email,
      }),

      User.exists({
        username:
          verification.username,
      }),
    ]);

    if (
      existingEmail ||
      existingUsername
    ) {
      await verification.deleteOne();

      return res.status(409).json({
        success: false,
        message: existingEmail
          ? "Email already registered."
          : "Username already taken.",
      });
    }

    const user = await User.create({
      fullName:
        verification.fullName,

      username:
        verification.username,

      email:
        verification.email,

      password:
        verification.password,
    });

    await verification.deleteOne();

    await safelyLogActivity({
      type: "user_registered",
      message:
        `${user.username} registered`,
      user: user._id,
    });

    return res.status(201).json({
      success: true,
      token: createAuthToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Email or username already exists.",
      });
    }

    return sendServerError(
      res,
      error,
      "Unable to verify registration."
    );
  }
}
/**
 * Returns the authenticated user's profile.
 */
async function getMe(req, res) {
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

    return res.status(200).json(user);
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to load profile."
    );
  }
}

/**
 * Updates general profile information and preferences.
 */
async function updateProfile(req, res) {
  try {
    const {
      fullName,
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

    if (fullName !== undefined) {
      const normalizedFullName =
        String(fullName).trim();

      if (!normalizedFullName) {
        return res.status(400).json({
          success: false,
          message:
            "Full name cannot be empty.",
        });
      }

      user.fullName =
        normalizedFullName;
    }

    if (bio !== undefined) {
      user.bio = String(bio).trim();
    }

    if (avatar !== undefined) {
      user.avatar = String(avatar);
    }

    if (theme !== undefined) {
      if (
        !["light", "dark"].includes(
          theme
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Theme must be light or dark.",
        });
      }

      user.theme = theme;
    }

    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to update profile."
    );
  }
}

/**
 * Stores a newly uploaded avatar and removes
 * the previous uploaded avatar.
 */
async function uploadProfilePicture(
  req,
  res
) {
  const uploadedFilePath =
    req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded.",
      });
    }

    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      if (uploadedFilePath) {
        await fs
          .unlink(uploadedFilePath)
          .catch(() => {});
      }

      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const previousAvatar =
      user.avatar;

    user.avatar =
      `/uploads/avatars/${req.file.filename}`;

    await user.save();

    await removeUploadedAvatar(
      previousAvatar
    );

    return res.status(200).json({
      success: true,
      avatar: user.avatar,
    });
  } catch (error) {
    if (uploadedFilePath) {
      await fs
        .unlink(uploadedFilePath)
        .catch(() => {});
    }

    return sendServerError(
      res,
      error,
      "Unable to upload profile picture."
    );
  }
}

/**
 * Updates the authenticated user's full name.
 */
async function updateFullName(req, res) {
  try {
    const fullName = String(
      req.body.fullName ?? ""
    ).trim();

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message:
          "Full name is required.",
      });
    }

    const user =
      await User.findByIdAndUpdate(
        req.user.id,
        {
          fullName,
        },
        {
          new: true,
          runValidators: true,
        }
      ).select(
        "-password -passwordResetToken -passwordResetExpires -__v"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to update full name."
    );
  }
}

/**
 * Starts the password-reset flow without revealing
 * whether the supplied email exists.
 */
async function forgotPassword(req, res) {
  try {
    const email = normalizeEmail(
      req.body.email
    );

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          GENERIC_RESET_MESSAGE,
      });
    }

    if (!process.env.FRONTEND_URL) {
      throw new Error(
        "FRONTEND_URL is not configured."
      );
    }

    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetExpires =
      Date.now() +
      PASSWORD_RESET_DURATION_MS;

    await user.save();

    const frontendUrl =
      process.env.FRONTEND_URL.replace(
        /\/$/,
        ""
      );

    const resetUrl =
      `${frontendUrl}/reset-password/` +
      encodeURIComponent(resetToken);

    try {
      await transporter.sendMail({
        from:
          process.env.EMAIL_FROM ||
          "Nudge <onboarding@resend.dev>",
        to: user.email,
        subject:
          "Nudge Password Reset",
        html: `
          <h2>Password Reset</h2>

          <p>
            Hello ${escapeHtml(
              user.fullName
            )},
          </p>

          <p>
            You requested a password reset.
          </p>

          <p>
            Click the button below to reset
            your password:
          </p>

          <a
            href="${escapeHtml(resetUrl)}"
            style="
              display: inline-block;
              padding: 12px 24px;
              background: #0ea5e9;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
            "
          >
            Reset Password
          </a>

          <p>
            This link expires in
            <strong>1 hour</strong>.
          </p>

          <p>
            If you did not request this,
            you can safely ignore this email.
          </p>
        `,
      });
    } catch (mailError) {
      user.passwordResetToken =
        undefined;

      user.passwordResetExpires =
        undefined;

      await user.save();

      throw mailError;
    }

    return res.status(200).json({
      success: true,
      message: GENERIC_RESET_MESSAGE,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to process password reset."
    );
  }
}

/**
 * Resets a password using a valid and unexpired token.
 */
async function resetPassword(req, res) {
  try {
    const token = String(
      req.params.token ?? ""
    ).trim();

    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message:
          "Reset token is required.",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,

      passwordResetExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Reset link is invalid or has expired.",
      });
    }

    user.password = await bcrypt.hash(
      password,
      BCRYPT_SALT_ROUNDS
    );

    user.passwordResetToken =
      undefined;

    user.passwordResetExpires =
      undefined;

    await user.save();

    await safelyLogActivity({
      type: "password_reset",
      message:
        `${user.username} reset their password`,
      user: user._id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully.",
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to reset password."
    );
  }
}

/**
 * Updates the authenticated user's username.
 */
async function updateUsername(req, res) {
  try {
    const username = normalizeUsername(
      req.body.username
    );

    if (!username) {
      return res.status(400).json({
        success: false,
        message:
          "Username is required.",
      });
    }

    const existingUser =
      await User.exists({
        username,

        _id: {
          $ne: req.user.id,
        },
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "Username already taken.",
      });
    }

    const user =
      await User.findByIdAndUpdate(
        req.user.id,
        {
          username,
        },
        {
          new: true,
          runValidators: true,
        }
      ).select(
        "-password -passwordResetToken -passwordResetExpires -__v"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "Username already taken.",
      });
    }

    return sendServerError(
      res,
      error,
      "Unable to update username."
    );
  }
}

/**
 * Updates the authenticated user's email address.
 */
async function updateEmail(req, res) {
  try {
    const email = normalizeEmail(
      req.body.email
    );

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const existingUser =
      await User.exists({
        email,

        _id: {
          $ne: req.user.id,
        },
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "Email already in use.",
      });
    }

    const user =
      await User.findByIdAndUpdate(
        req.user.id,
        {
          email,
        },
        {
          new: true,
          runValidators: true,
        }
      ).select(
        "-password -passwordResetToken -passwordResetExpires -__v"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "Email already in use.",
      });
    }

    return sendServerError(
      res,
      error,
      "Unable to update email."
    );
  }
}

/**
 * Updates the authenticated user's password.
 */
async function updatePassword(req, res) {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill all password fields.",
      });
    }

    if (
      newPassword !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Passwords do not match.",
      });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters.",
      });
    }

    if (
      currentPassword === newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from the current password.",
      });
    }

    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message:
          "Current password is incorrect.",
      });
    }

    user.password = await bcrypt.hash(
      newPassword,
      BCRYPT_SALT_ROUNDS
    );

    user.passwordResetToken =
      undefined;

    user.passwordResetExpires =
      undefined;

    await user.save();

    await safelyLogActivity({
      type: "password_updated",
      message:
        `${user.username} updated their password`,
      user: user._id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Password updated successfully.",
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to update password."
    );
  }
}
/**
 * Authenticates a Google user and creates
 * a local account when necessary.
 */
async function googleLogin(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message:
          "Google credential is required.",
      });
    }

    if (
      !process.env.GOOGLE_CLIENT_ID
    ) {
      throw new Error(
        "GOOGLE_CLIENT_ID is not configured."
      );
    }

    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience:
          process.env.GOOGLE_CLIENT_ID,
      });

    const payload =
      ticket.getPayload();

    if (
      !payload?.email ||
      !payload.email_verified
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Google email is not verified.",
      });
    }

    const email = normalizeEmail(
      payload.email
    );

    let user = await User.findOne({
      email,
    });

    let created = false;

    if (!user) {
      const username =
        await createUniqueGoogleUsername(
          email
        );

      const randomPassword = crypto
        .randomBytes(32)
        .toString("hex");

      const hashedPassword =
        await bcrypt.hash(
          randomPassword,
          BCRYPT_SALT_ROUNDS
        );

      user = await User.create({
        fullName:
          String(
            payload.name ||
              username
          ).trim(),

        username,
        email,

        password:
          hashedPassword,

        avatar:
          payload.picture || "",
      });

      created = true;
    }

    await safelyLogActivity({
      type: created
        ? "user_registered"
        : "user_login",

      message: created
        ? `${user.username} registered`
        : `${user.username} logged in`,

      user: user._id,
    });

    return res.status(200).json({
      success: true,
      token: createAuthToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    const message =
      error?.message || "";

    const invalidGoogleToken =
      message.includes(
        "Token used too late"
      ) ||
      message.includes(
        "Wrong recipient"
      ) ||
      message.includes(
        "Invalid token"
      );

    if (invalidGoogleToken) {
      return res.status(401).json({
        success: false,
        message:
          "Google authentication failed.",
      });
    }

    return sendServerError(
      res,
      error,
      "Google authentication failed."
    );
  }
}

/**
 * Deletes the authenticated user's account
 * and all owned application data.
 */
async function deleteMyAccount(
  req,
  res
) {
  try {
    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role !== "user") {
      return res.status(403).json({
        success: false,
        message:
          "Admins cannot delete their own accounts.",
      });
    }

    await Promise.all([
      Note.deleteMany({
        user: user._id,
      }),

      Reminder.deleteMany({
        user: user._id,
      }),

      Birthday.deleteMany({
        user: user._id,
      }),

      Link.deleteMany({
        user: user._id,
      }),

      EmailVerification.deleteMany({
        email: user.email,
      }),
    ]);

    await safelyLogActivity({
      type: "user_deleted",
      message:
        `${user.username} deleted their account`,
      user: user._id,
    });

    const avatar = user.avatar;

    await user.deleteOne();

    await removeUploadedAvatar(
      avatar
    );

    return res.status(200).json({
      success: true,
      message:
        "Account deleted successfully.",
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to delete account."
    );
  }
}

module.exports = {
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
};