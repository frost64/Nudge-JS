const SystemLog = require("../models/SystemLog");

const systemLogger = async ({
  level = "info",
  category = "system",
  source,
  message,
  details = {},
}) => {
  try {
    await SystemLog.create({
      level,
      category,
      source,
      message,
      details,
    });
  } catch (error) {
    console.error(
      "System Logger Error:",
      error.message
    );
  }
};

module.exports = systemLogger;