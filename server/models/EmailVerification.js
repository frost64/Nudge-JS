const mongoose = require("mongoose");

const emailVerificationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically remove expired OTP documents
emailVerificationSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
  }
);

module.exports = mongoose.model(
  "EmailVerification",
  emailVerificationSchema
);