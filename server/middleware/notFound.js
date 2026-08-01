const systemLogger = require("../utils/systemLogger");

const notFound = async (
  req,
  res,
  next
) => {

  await systemLogger({
    level: "info",
    category: "routing",
    source: "Routing",
    message: "Route not found",
    details: {
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip,
    },
  });

  res.status(404);

  const error = new Error(
    `Route Not Found - ${req.originalUrl}`
  );

  next(error);
};

module.exports = notFound;