const mongoose = require("mongoose");
const systemLogger = require("../utils/systemLogger");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");

    await systemLogger({
      level: "success",
      category: "database",
      source: "Database",
      message: "MongoDB connected successfully",
    });
  } catch (error) {
    console.error(error);

    await systemLogger({
      level: "error",
      category: "database",
      source: "Database",
      message: "MongoDB connection failed",
      details: {
        error: error.message,
      },
    });

    process.exit(1);
  }
};

module.exports = connectDB;