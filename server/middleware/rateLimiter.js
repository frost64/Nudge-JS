const rateLimitPackage = require(
  "express-rate-limit"
);

const systemLogger = require(
  "../utils/systemLogger"
);

/*
 * Supports both older default exports and newer
 * named exports of express-rate-limit.
 */
const rateLimit =
  rateLimitPackage.rateLimit ||
  rateLimitPackage.default ||
  rateLimitPackage;

const DEFAULT_WINDOW_MS =
  15 * 60 * 1000;

const DEFAULT_MAX_REQUESTS = 1000;

const TOO_MANY_REQUESTS_STATUS = 429;

/**
 * Parses a positive integer environment variable.
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

const windowMs = parsePositiveInteger(
  process.env.RATE_LIMIT_WINDOW_MS,
  DEFAULT_WINDOW_MS
);

const maxRequests = parsePositiveInteger(
  process.env.RATE_LIMIT_MAX_REQUESTS,
  DEFAULT_MAX_REQUESTS
);

/**
 * Writes a rate-limit warning without allowing
 * logging failures to interrupt the response.
 *
 * @param {import("express").Request} req
 * @returns {Promise<void>}
 */
async function safelyLogRateLimit(req) {
  try {
    await systemLogger({
      level: "warning",
      category: "security",
      source: "Rate Limiter",
      message: "Rate limit exceeded",

      details: {
        ip: req.ip,

        endpoint:
          req.originalUrl ||
          req.url,

        method: req.method,

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

        limit:
          req.rateLimit?.limit ??
          maxRequests,

        used:
          req.rateLimit?.used ??
          req.rateLimit?.current ??
          null,

        remaining:
          req.rateLimit?.remaining ??
          0,

        resetTime:
          req.rateLimit?.resetTime ??
          null,
      },
    });
  } catch (error) {
    console.error(
      "Failed to write rate-limit log:",
      error
    );
  }
}

/**
 * Global API rate limiter.
 *
 * Environment variables:
 * RATE_LIMIT_WINDOW_MS
 * RATE_LIMIT_MAX_REQUESTS
 */
const limiter = rateLimit({
  windowMs,

  /*
   * `max` remains compatible with older and newer
   * express-rate-limit releases.
   */
  max: maxRequests,

  /*
   * Sends RateLimit-* and Retry-After headers.
   */
  standardHeaders: true,

  /*
   * Disables deprecated X-RateLimit-* headers.
   */
  legacyHeaders: false,

  statusCode:
    TOO_MANY_REQUESTS_STATUS,

  /*
   * CORS preflight requests should not consume
   * the user's request allowance.
   */
  skip(req) {
    return req.method === "OPTIONS";
  },

  handler(req, res) {
    /*
     * Logging runs independently so a slow database
     * logger does not delay the 429 response.
     */
    void safelyLogRateLimit(req);

    return res
      .status(
        TOO_MANY_REQUESTS_STATUS
      )
      .json({
        success: false,
        message:
          "Too many requests. Please try again later.",
      });
  },
});

module.exports = limiter;