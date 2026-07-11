const User = require("../models/User");
const Note = require("../models/Note");
const Reminder = require("../models/Reminder");
const Birthday = require("../models/Birthday");
const Link = require("../models/Link");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

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


const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingEmail = await User.findOne({
  email
});

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
      username,
      email,
      password: hashedPassword
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

    const existingUser = await User.findOne({
      email,
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

    user.email = email;

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
  updateUsername,
  updateEmail,
  updatePassword,
  deleteMyAccount,
};

