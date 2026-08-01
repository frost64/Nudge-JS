const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};

// Hash OTP before saving
const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

// Compare entered OTP with hashed OTP
const compareOTP = async (otp, hashedOTP) => {
  return await bcrypt.compare(otp, hashedOTP);
};

// OTP expires after 10 minutes
const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

module.exports = {
  generateOTP,
  hashOTP,
  compareOTP,
  getOTPExpiry,
};