const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/User");
const systemLogger = require("../utils/systemLogger");

/**
 * Writes an authentication warning without allowing
 * logging failures to interrupt the request response.
 *
 * @param {import("express").Request} req
 * @param {string} message
 * @param {object} [additionalDetails]
 * @returns {Promise<void>}
 */
async function safelyLogAuthenticationWarning(
  req,
  message,
  additionalDetails = {}
) {
  try {
    await systemLogger({
      level: "warning",
      category: "authentication",
      source: "Authentication",
      message,
      details: {
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent:
          req.get("user-agent") ||
          "unknown",
        ...additionalDetails,
      },
    });
  } catch (error) {
    console.error(
      "Failed to write authentication log:",
      error
    );
  }
}

/**
 * Extracts a JWT from a Bearer authorization header.
 *
 * @param {unknown} authorizationHeader
 * @returns {string|null}
 */
function extractBearerToken(
  authorizationHeader
) {
  if (
    typeof authorizationHeader !==
    "string"
  ) {
    return null;
  }

  const parts =
    authorizationHeader
      .trim()
      .split(/\s+/);

  if (
    parts.length !== 2 ||
    parts[0].toLowerCase() !==
      "bearer" ||
    !parts[1]
  ) {
    return null;
  }

  return parts[1];
}

/**
 * Verifies the JWT and attaches the authenticated
 * user document to req.user.
 */
async function authMiddleware(
  req,
  res,
  next
) {
  try {
    const authorizationHeader =
      req.get("authorization");

    if (!authorizationHeader) {
      await safelyLogAuthenticationWarning(
        req,
        "Request without authentication token"
      );

      return res.status(401).json({
        success: false,
        message:
          "No token provided.",
      });
    }

    const token = extractBearerToken(
      authorizationHeader
    );

    if (!token) {
      await safelyLogAuthenticationWarning(
        req,
        "Malformed authorization header"
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization header.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is not configured."
      );

      return res.status(500).json({
        success: false,
        message:
          "Authentication service is not configured.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        algorithms: ["HS256"],
      }
    );

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !decoded.id ||
      !mongoose.isValidObjectId(
        decoded.id
      )
    ) {
      await safelyLogAuthenticationWarning(
        req,
        "JWT contains an invalid user identifier"
      );

      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    const user = await User.findById(
      decoded.id
    ).select(
      [
        "_id",
        "fullName",
        "username",
        "email",
        "role",
        "avatar",
        "bio",
        "theme",
        "createdAt",
        "updatedAt",
      ].join(" ")
    );

    if (!user) {
      await safelyLogAuthenticationWarning(
        req,
        "Authentication failed: user not found",
        {
          userId: decoded.id,
        }
      );

      return res.status(401).json({
        success: false,
        message:
          "User account not found.",
      });
    }

    req.user = user;

    return next();
  } catch (error) {
    const isExpiredToken =
      error?.name ===
      "TokenExpiredError";

    await safelyLogAuthenticationWarning(
      req,
      isExpiredToken
        ? "Expired JWT authentication attempt"
        : "Invalid JWT authentication attempt",
      {
        errorType:
          error?.name ||
          "UnknownAuthenticationError",
      }
    );

    return res.status(401).json({
      success: false,
      message: isExpiredToken
        ? "Token has expired."
        : "Invalid token.",
    });
  }
}

module.exports = authMiddleware;