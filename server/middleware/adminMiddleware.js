const systemLogger = require("../utils/systemLogger");

/**
 * Writes a security warning without allowing logging failures
 * to interrupt the authorization response.
 *
 * @param {import("express").Request} req
 * @param {string} message
 * @returns {Promise<void>}
 */
async function safelyLogUnauthorizedAccess(
  req,
  message
) {
  try {
    await systemLogger({
      level: "warning",
      category: "security",
      source: "Security",
      message,
      details: {
        userId:
          req.user?.id ||
          req.user?._id ||
          null,

        username:
          req.user?.username ||
          "unknown",

        role:
          req.user?.role ||
          "unauthenticated",

        endpoint:
          req.originalUrl,

        method:
          req.method,

        ip:
          req.ip,

        userAgent:
          req.get("user-agent") ||
          "unknown",
      },
    });
  } catch (error) {
    console.error(
      "Failed to write unauthorized-access log:",
      error
    );
  }
}

/**
 * Allows access only to authenticated administrators.
 */
async function adminMiddleware(
  req,
  res,
  next
) {
  if (!req.user) {
    await safelyLogUnauthorizedAccess(
      req,
      "Unauthenticated admin access attempt"
    );

    return res.status(401).json({
      success: false,
      message:
        "Authentication required.",
    });
  }

  if (req.user.role !== "admin") {
    await safelyLogUnauthorizedAccess(
      req,
      "Unauthorized admin access attempt"
    );

    return res.status(403).json({
      success: false,
      message: "Admin access only.",
    });
  }

  return next();
}

module.exports = adminMiddleware;