const User = require("../models/User");
const Note = require("../models/Note");
const Reminder = require("../models/Reminder");
const Birthday = require("../models/Birthday");
const Link = require("../models/Link");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const transporter = require("../config/mailer");
const { OAuth2Client } = require("google-auth-library");
const logActivity = require("../utils/activityLogger");

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    const userData = {
      fullName: user.fullName,
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      theme: user.theme
    };

    res.status(200).json({
      success: true,
      token,
      user: userData
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

const registerUser = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });
if (!fullName?.trim()) {
  return res.status(400).json({
    message: "Full name is required",
  });
}
if (existingEmail) {
  return res.status(400).json({
    message: "Email already registered"
  });
}

const existingUsername =
  await User.findOne({
    username
  });

if (existingUsername) {
  return res.status(400).json({
    message: "Username already taken"
  });
}

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      username,
      email: normalizedEmail,
      password: hashedPassword
    });

    await logActivity({
      type: "user_registered",
      message: `${user.username} registered`,
      user: user._id,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: user._id
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getMe = async (req, res) => {
  try {

    const user = await User.findById(req.user.id)
      .select("-password -__v");

    res.status(200).json(user);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};
const updateProfile = async (req, res) => {
  try {

    const {
      fullName,
      bio,
      avatar,
      theme,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (fullName !== undefined) {
      user.fullName = fullName;
    }
    if (bio !== undefined) {
      user.bio = bio;
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    if (theme !== undefined) {
      user.theme = theme;
    }

    await user.save();

    res.status(200).json(user);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }
// Delete previous uploaded avatar only
if (
  user.avatar &&
  user.avatar.startsWith("/uploads/avatars/")
) {
  const oldPath = path.join(
    __dirname,
    "..",
    user.avatar
  );

  if (fs.existsSync(oldPath)) {
    fs.unlinkSync(oldPath);
  }
}

// Multer already saved the uploaded file
user.avatar = `/uploads/avatars/${req.file.filename}`;

await user.save();

res.json({
  avatar: user.avatar,
});

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const updateFullName = async (req, res) => {
  try {

    const { fullName } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        message: "Full name is required.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.fullName = fullName.trim();

    await user.save();

    res.status(200).json(user);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Don't reveal whether the email exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with that email, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires =
      Date.now() + 1000 * 60 * 60; // 1 hour

    await user.save();

    const resetUrl =
      `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Nudge Password Reset",
      html: `
        <h2>Password Reset</h2>

        <p>Hello ${user.fullName},</p>

        <p>You requested a password reset.</p>

        <p>
          Click the button below to reset your password:
        </p>

        <a
          href="${resetUrl}"
          style="
            display:inline-block;
            padding:12px 24px;
            background:#0ea5e9;
            color:white;
            text-decoration:none;
            border-radius:8px;
          "
        >
          Reset Password
        </a>

        <p>
          This link expires in <strong>1 hour</strong>.
        </p>

        <p>
          If you didn't request this, you can safely ignore this email.
        </p>
      `,
    });

    res.status(200).json({
      success: true,
      message:
        "If an account exists with that email, a reset link has been sent.",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {

    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
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
        message: "Reset link is invalid or has expired.",
      });
    }

    user.password = await bcrypt.hash(password, 10);

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully.",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

const updateUsername = async (req, res) => {
  try {

    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        message: "Username is required."
      });
    }

    const existingUser = await User.findOne({
      username,
      _id: { $ne: req.user.id }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username already taken."
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username },
      { new: true }
    ).select("-password");

    res.status(200).json(user);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const updateEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already in use.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.email = normalizedEmail;

    await user.save();

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updatePassword = async (req, res) => {

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
        message: "Please fill all password fields.",
      });

    }

    if (newPassword !== confirmPassword) {

      return res.status(400).json({
        message: "Passwords do not match.",
      });

    }

    if (newPassword.length < 6) {

      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });

    }

    const user = await User.findById(req.user.id);

    if (!user) {

      return res.status(404).json({
        message: "User not found.",
      });

    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {

      return res.status(400).json({
        message: "Current password is incorrect.",
      });

    }

    user.password = await bcrypt.hash(
      newPassword,
      10
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      email,
      name,
      picture,
      email_verified,
    } = payload;

    if (!email_verified) {
      return res.status(400).json({
        message: "Google email is not verified.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      const username =
        normalizedEmail.split("@")[0] +
        Math.floor(Math.random() * 10000);

      const randomPassword =
        crypto.randomBytes(32).toString("hex");

      const hashedPassword =
        await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        fullName: name,
        username,
        email: normalizedEmail,
        password: hashedPassword,
        avatar: picture,
      });
    }
    await logActivity({
      type: "user_registered",
      message: `${user.username} registered`,
      user: user._id,
    });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        theme: user.theme,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const deleteMyAccount = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.role !== "user") {
      return res.status(403).json({
        message: "Admins cannot delete their own accounts."
      });
    }

    await Promise.all([
      Note.deleteMany({ user: user._id }),
      Reminder.deleteMany({ user: user._id }),
      Birthday.deleteMany({ user: user._id }),
      Link.deleteMany({ user: user._id })
    ]);
    if (
      user.avatar &&
      user.avatar.startsWith("/uploads/avatars/")
    ) {
      const avatarPath = path.join(
        __dirname,
        "..",
        user.avatar
      );

      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }
    await logActivity({
      type: "user_deleted",
      message: `${user.username} deleted their account`,
      user: user._id,
    });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "Account deleted successfully."
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

module.exports = {
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
};

