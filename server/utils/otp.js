const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const OTP_MINIMUM = 100_000;
const OTP_MAXIMUM_EXCLUSIVE = 1_000_000;
const OTP_EXPIRY_MINUTES = 10;
const OTP_HASH_ROUNDS = 10;
const OTP_PATTERN = /^\d{6}$/;

/**
 * Normalizes an OTP value into trimmed text.
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeOTP(value) {
  return String(value ?? "").trim();
}

/**
 * Checks whether a value is a valid six-digit OTP.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isValidOTP(value) {
  return OTP_PATTERN.test(
    normalizeOTP(value)
  );
}

/**
 * Generates a cryptographically secure six-digit OTP.
 *
 * @returns {string}
 */
function generateOTP() {
  return crypto
    .randomInt(
      OTP_MINIMUM,
      OTP_MAXIMUM_EXCLUSIVE
    )
    .toString();
}

/**
 * Hashes a valid OTP before database storage.
 *
 * @param {unknown} otp
 * @returns {Promise<string>}
 */
async function hashOTP(otp) {
  const normalizedOTP =
    normalizeOTP(otp);

  if (!isValidOTP(normalizedOTP)) {
    throw new TypeError(
      "OTP must contain exactly 6 digits."
    );
  }

  return bcrypt.hash(
    normalizedOTP,
    OTP_HASH_ROUNDS
  );
}

/**
 * Compares a submitted OTP with its stored bcrypt hash.
 *
 * Invalid input returns false rather than throwing.
 *
 * @param {unknown} otp
 * @param {unknown} hashedOTP
 * @returns {Promise<boolean>}
 */
async function compareOTP(
  otp,
  hashedOTP
) {
  const normalizedOTP =
    normalizeOTP(otp);

  if (
    !isValidOTP(normalizedOTP) ||
    typeof hashedOTP !== "string" ||
    !hashedOTP.trim()
  ) {
    return false;
  }

  try {
    return await bcrypt.compare(
      normalizedOTP,
      hashedOTP
    );
  } catch (error) {
    console.error(
      "OTP comparison failed:",
      error
    );

    return false;
  }
}

/**
 * Returns the OTP expiration timestamp.
 *
 * @param {Date} [fromDate]
 * @returns {Date}
 */
function getOTPExpiry(
  fromDate = new Date()
) {
  const startTime =
    fromDate instanceof Date
      ? fromDate.getTime()
      : Number.NaN;

  if (Number.isNaN(startTime)) {
    throw new TypeError(
      "OTP expiry requires a valid date."
    );
  }

  return new Date(
    startTime +
      OTP_EXPIRY_MINUTES *
        60 *
        1000
  );
}

module.exports = {
  compareOTP,
  generateOTP,
  getOTPExpiry,
  hashOTP,
  isValidOTP,
};