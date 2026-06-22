const User = require("../models/User");
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
      theme
    } = req.body;

    const user =
      await User.findByIdAndUpdate(
        req.user.id,
        {
          bio,
          avatar,
          theme
        },
        {
          new: true
        }
      ).select("-password");

    res.status(200).json(user);

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
  updateProfile
}; 