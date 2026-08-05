const mongoose = require("mongoose");

const systemLogger = require("../utils/systemLogger");

/**
 * Connects the application to MongoDB.
 *
 * Terminates the process when the initial connection fails,
 * because the server should not run without a database.
 *
 * @returns {Promise<void>}
 */
async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    const error = new Error(
      "MONGO_URI is not defined in the environment."
    );

    console.error(error.message);

    await logDatabaseFailure(error);

    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);

    console.log("MongoDB connected successfully.");

    await safelyLogSystemEvent({
      level: "success",
      category: "database",
      source: "Database",
      message: "MongoDB connected successfully",
    });
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error
    );

    await logDatabaseFailure(error);

    process.exit(1);
  }
}

/**
 * Records a database connection failure.
 *
 * @param {Error} error
 * @returns {Promise<void>}
 */
async function logDatabaseFailure(error) {
  await safelyLogSystemEvent({
    level: "error",
    category: "database",
    source: "Database",
    message: "MongoDB connection failed",
    details: {
      error: error.message,
      name: error.name,
    },
  });
}

/**
 * Prevents logging failures from hiding the original
 * database connection result.
 *
 * @param {object} event
 * @returns {Promise<void>}
 */
async function safelyLogSystemEvent(event) {
  try {
    await systemLogger(event);
  } catch (loggingError) {
    console.error(
      "Failed to write database system log:",
      loggingError
    );
  }
}

module.exports = connectDB;