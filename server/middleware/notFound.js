const systemLogger = require("../utils/systemLogger");

const NOT_FOUND_STATUS = 404;

/**
 * Writes a route-not-found log without allowing logging
 * failures to interrupt the error-handling flow.
 *
 * @param {import("express").Request} req
 * @returns {Promise<void>}
 */
async function safelyLogNotFound(req) {
  try {
    await systemLogger({
      level: "info",
      category: "routing",
      source: "Routing",
      message: "Route not found",
      details: {
        endpoint:
          req.originalUrl || req.url,

        method: req.method,
        ip: req.ip,

        userId:
          req.user?.id ||
          req.user?._id ||
          null,

        username:
          req.user?.username ||
          null,

        userAgent:
          req.get("user-agent") ||
          "unknown",
      },
    });
  } catch (error) {
    console.error(
      "Failed to write route-not-found log:",
      error
    );
  }
}

/**
 * Forwards unmatched requests to the central
 * Express error-handling middleware.
 */
async function notFound(
  req,
  res,
  next
) {
  await safelyLogNotFound(req);

  const endpoint =
    req.originalUrl || req.url;

  const error = new Error(
    `Route Not Found - ${endpoint}`
  );

  error.statusCode =
    NOT_FOUND_STATUS;

  return next(error);
}

module.exports = notFound;