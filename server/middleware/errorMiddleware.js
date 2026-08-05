const systemLogger = require("../utils/systemLogger");

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Determines the appropriate HTTP status code for an error.
 *
 * @param {Error & {
 *   status?: number,
 *   statusCode?: number,
 *   code?: string|number
 * }} error
 * @param {import("express").Response} res
 * @returns {number}
 */
function getStatusCode(error, res) {
  const explicitStatus =
    Number(error?.statusCode) ||
    Number(error?.status);

  if (
    Number.isInteger(explicitStatus) &&
    explicitStatus >= 400 &&
    explicitStatus <= 599
  ) {
    return explicitStatus;
  }

  if (error?.name === "ValidationError") {
    return HTTP_STATUS.BAD_REQUEST;
  }

  if (error?.name === "CastError") {
    return HTTP_STATUS.BAD_REQUEST;
  }

  if (error?.code === 11000) {
    return HTTP_STATUS.CONFLICT;
  }

  if (
    error?.name === "JsonWebTokenError" ||
    error?.name === "TokenExpiredError"
  ) {
    return HTTP_STATUS.UNAUTHORIZED;
  }

  if (error?.name === "MulterError") {
    return error.code === "LIMIT_FILE_SIZE"
      ? HTTP_STATUS.PAYLOAD_TOO_LARGE
      : HTTP_STATUS.BAD_REQUEST;
  }

  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    "body" in error
  ) {
    return HTTP_STATUS.BAD_REQUEST;
  }

  if (
    res.statusCode >= 400 &&
    res.statusCode <= 599
  ) {
    return res.statusCode;
  }

  return HTTP_STATUS.INTERNAL_SERVER_ERROR;
}

/**
 * Returns a client-safe message for an error.
 *
 * @param {Error & {
 *   code?: string|number,
 *   keyPattern?: object,
 *   keyValue?: object,
 *   errors?: object
 * }} error
 * @param {number} statusCode
 * @returns {string}
 */
function getErrorMessage(
  error,
  statusCode
) {
  if (error?.code === 11000) {
    const duplicateField =
      Object.keys(
        error.keyPattern ||
          error.keyValue ||
          {}
      )[0] || "value";

    return `${duplicateField} already exists.`;
  }

  if (
    error?.name === "ValidationError"
  ) {
    const validationMessage =
      Object.values(error.errors || {})
        .map((item) => item.message)
        .filter(Boolean)
        .join(" ");

    return (
      validationMessage ||
      "Validation failed."
    );
  }

  if (error?.name === "CastError") {
    return `Invalid ${error.path || "value"}.`;
  }

  if (
    error?.name === "TokenExpiredError"
  ) {
    return "Token has expired.";
  }

  if (
    error?.name === "JsonWebTokenError"
  ) {
    return "Invalid token.";
  }

  if (error?.name === "MulterError") {
    if (
      error.code === "LIMIT_FILE_SIZE"
    ) {
      return "Uploaded file is too large.";
    }

    return (
      error.message ||
      "File upload failed."
    );
  }

  if (
    statusCode <
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  ) {
    return (
      error?.message ||
      "Request failed."
    );
  }

  if (
    process.env.NODE_ENV !== "production"
  ) {
    return (
      error?.message ||
      "Internal server error."
    );
  }

  return "Internal server error.";
}

/**
 * Writes an API error log without allowing logger
 * failures to interrupt the error response.
 *
 * @param {Error} error
 * @param {import("express").Request} req
 * @param {number} statusCode
 * @returns {Promise<void>}
 */
async function safelyLogError(
  error,
  req,
  statusCode
) {
  try {
    const details = {
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip,
      statusCode,

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

      errorName:
        error?.name ||
        "Error",

      errorCode:
        error?.code ||
        null,

      error:
        error?.message ||
        "Unknown error",
    };

    if (
      process.env.NODE_ENV !==
        "production" &&
      error?.stack
    ) {
      details.stack = error.stack;
    }

    await systemLogger({
      level:
        statusCode >= 500
          ? "error"
          : "warning",

      category: "api",
      source: "API",

      message:
        error?.message ||
        "Unhandled API error",

      details,
    });
  } catch (loggingError) {
    console.error(
      "Failed to write system error log:",
      loggingError
    );
  }
}

/**
 * Handles errors forwarded by Express routes and middleware.
 *
 * Keep all four parameters so Express recognizes this
 * function as error-handling middleware.
 */
async function errorHandler(
  error,
  req,
  res,
  next
) {
  console.error(error);

  const statusCode = getStatusCode(
    error,
    res
  );

  await safelyLogError(
    error,
    req,
    statusCode
  );

  if (res.headersSent) {
    return next(error);
  }

  const message = getErrorMessage(
    error,
    statusCode
  );

  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;