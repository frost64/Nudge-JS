const rateLimit = require("express-rate-limit");
const systemLogger = require("../utils/systemLogger");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  max: 1000,

  standardHeaders: true,
  legacyHeaders: false,

  handler: async (req, res) => {

    await systemLogger({
      level: "warning",
      category: "security",
      source: "Rate Limiter",
      message: "Rate limit exceeded",
      details: {
        ip: req.ip,
        endpoint: req.originalUrl,
        method: req.method,
      },
    });

    res.status(429).json({
      success: false,
      message:
        "Too many requests. Please try again later.",
    });
  },
});

module.exports = limiter;