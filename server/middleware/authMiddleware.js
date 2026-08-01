const jwt = require("jsonwebtoken");
const User = require("../models/User");
const systemLogger = require("../utils/systemLogger");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {

      await systemLogger({
        level: "warning",
        category: "authentication",
        source: "Authentication",
        message: "Request without authentication token",
        details: {
          endpoint: req.originalUrl,
          method: req.method,
          ip: req.ip,
        },
      });

      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {

      await systemLogger({
        level: "warning",
        category: "authentication",
        source: "Authentication",
        message: "Authentication failed: User not found",
        details: {
          endpoint: req.originalUrl,
          method: req.method,
          ip: req.ip,
        },
      });

      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user;
    next();

  } catch (error) {

    await systemLogger({
      level: "warning",
      category: "authentication",
      source: "Authentication",
      message: "Invalid or expired JWT",
      details: {
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip,
        error: error.message,
      },
    });

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = authMiddleware;