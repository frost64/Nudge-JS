const systemLogger = require("../utils/systemLogger");

const adminMiddleware = async (
  req,
  res,
  next
) => {
  if (req.user.role !== "admin") {

    await systemLogger({
      level: "warning",
      category: "security",
      source: "Security",
      message: "Unauthorized admin access attempt",
      details: {
        user: req.user.username,
        role: req.user.role,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip,
      },
    });

    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }

  next();
};

module.exports = adminMiddleware;