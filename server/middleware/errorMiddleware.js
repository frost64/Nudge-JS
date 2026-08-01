const systemLogger = require("../utils/systemLogger");

const errorHandler = async (
  err,
  req,
  res,
  next
) => {
  console.error(err);

  const statusCode =
    res.statusCode === 200
      ? 500
      : res.statusCode;

  await systemLogger({
    level: "error",
    category: "api",
    source: "API",
    message: err.message,
    details: {
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip,
      statusCode,
      error: err.message,
    },
  });

  res.status(statusCode).json({
    success: false,
    message: err.message,
  });
};

module.exports = errorHandler;