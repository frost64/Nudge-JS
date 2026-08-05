const SystemLog = require("../models/SystemLog");

const DEFAULT_LEVEL = "info";
const DEFAULT_CATEGORY = "system";

const MAX_SOURCE_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_DETAIL_STRING_LENGTH = 2000;
const MAX_DETAIL_DEPTH = 5;
const MAX_ARRAY_ITEMS = 50;
const MAX_OBJECT_KEYS = 100;

const ALLOWED_LEVELS = new Set([
  "info",
  "success",
  "warning",
  "error",
]);

const ALLOWED_CATEGORIES = new Set([
  "startup",
  "database",
  "authentication",
  "security",
  "routing",
  "mail",
  "api",
  "scheduler",
  "system",
]);

const SENSITIVE_KEY_PATTERN =
  /password|token|authorization|cookie|secret|otp|credential|api[-_]?key/i;

/**
 * Normalizes and limits a required text value.
 *
 * @param {unknown} value
 * @param {number} maximumLength
 * @returns {string}
 */
function normalizeText(
  value,
  maximumLength
) {
  return String(value ?? "")
    .trim()
    .slice(0, maximumLength);
}

/**
 * Normalizes a system-log level.
 *
 * Invalid values fall back to "info" so logging
 * does not fail because of an unsupported level.
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeLevel(value) {
  const normalizedValue = String(
    value ?? ""
  )
    .trim()
    .toLowerCase();

  return ALLOWED_LEVELS.has(
    normalizedValue
  )
    ? normalizedValue
    : DEFAULT_LEVEL;
}

/**
 * Normalizes a system-log category.
 *
 * Invalid values fall back to "system".
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeCategory(value) {
  const normalizedValue = String(
    value ?? ""
  )
    .trim()
    .toLowerCase();

  return ALLOWED_CATEGORIES.has(
    normalizedValue
  )
    ? normalizedValue
    : DEFAULT_CATEGORY;
}

/**
 * Safely converts log details into MongoDB-compatible data.
 *
 * Sensitive values are redacted and circular references,
 * oversized arrays, and excessive nesting are contained.
 *
 * @param {unknown} value
 * @param {WeakSet<object>} seen
 * @param {number} depth
 * @returns {unknown}
 */
function sanitizeLogValue(
  value,
  seen = new WeakSet(),
  depth = 0
) {
  if (
    value === null ||
    value === undefined
  ) {
    return value ?? null;
  }

  if (typeof value === "string") {
    return value.slice(
      0,
      MAX_DETAIL_STRING_LENGTH
    );
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "function") {
    return "[Function]";
  }

  if (typeof value === "symbol") {
    return value.toString();
  }

  if (value instanceof Date) {
    return Number.isNaN(
      value.getTime()
    )
      ? null
      : value.toISOString();
  }

  if (value instanceof Error) {
    const errorDetails = {
      name: value.name,
      message: normalizeText(
        value.message,
        MAX_DETAIL_STRING_LENGTH
      ),
    };

    if (
      process.env.NODE_ENV !==
        "production" &&
      value.stack
    ) {
      errorDetails.stack =
        value.stack.slice(
          0,
          MAX_DETAIL_STRING_LENGTH
        );
    }

    return errorDetails;
  }

  if (Buffer.isBuffer(value)) {
    return `[Buffer: ${value.length} bytes]`;
  }

  if (
    typeof value?.toHexString ===
    "function"
  ) {
    return value.toHexString();
  }

  if (depth >= MAX_DETAIL_DEPTH) {
    return "[Maximum depth reached]";
  }

  if (
    typeof value === "object"
  ) {
    if (seen.has(value)) {
      return "[Circular reference]";
    }

    seen.add(value);

    if (Array.isArray(value)) {
      const sanitizedArray = value
        .slice(0, MAX_ARRAY_ITEMS)
        .map((item) =>
          sanitizeLogValue(
            item,
            seen,
            depth + 1
          )
        );

      if (
        value.length >
        MAX_ARRAY_ITEMS
      ) {
        sanitizedArray.push(
          `[${value.length - MAX_ARRAY_ITEMS} additional items omitted]`
        );
      }

      seen.delete(value);

      return sanitizedArray;
    }

    const sanitizedObject = {};

    const entries = Object.entries(
      value
    ).slice(0, MAX_OBJECT_KEYS);

    for (const [key, item] of entries) {
      sanitizedObject[key] =
        SENSITIVE_KEY_PATTERN.test(key)
          ? "[REDACTED]"
          : sanitizeLogValue(
              item,
              seen,
              depth + 1
            );
    }

    if (
      Object.keys(value).length >
      MAX_OBJECT_KEYS
    ) {
      sanitizedObject._truncated =
        "Additional properties omitted.";
    }

    seen.delete(value);

    return sanitizedObject;
  }

  return String(value).slice(
    0,
    MAX_DETAIL_STRING_LENGTH
  );
}

/**
 * Returns sanitized log details as an object.
 *
 * @param {unknown} details
 * @returns {object}
 */
function sanitizeDetails(details) {
  if (
    details === null ||
    details === undefined
  ) {
    return {};
  }

  const sanitized =
    sanitizeLogValue(details);

  if (
    sanitized &&
    typeof sanitized === "object" &&
    !Array.isArray(sanitized)
  ) {
    return sanitized;
  }

  return {
    value: sanitized,
  };
}

/**
 * Creates a system-log record.
 *
 * Logger failures are contained so logging never breaks
 * the original API request, middleware, or startup flow.
 *
 * @param {object} log
 * @param {string} [log.level]
 * @param {string} [log.category]
 * @param {string} log.source
 * @param {string} log.message
 * @param {object} [log.details]
 * @returns {Promise<object|null>}
 */
async function systemLogger({
  level = DEFAULT_LEVEL,
  category = DEFAULT_CATEGORY,
  source,
  message,
  details = {},
} = {}) {
  try {
    const normalizedSource =
      normalizeText(
        source,
        MAX_SOURCE_LENGTH
      );

    const normalizedMessage =
      normalizeText(
        message,
        MAX_MESSAGE_LENGTH
      );

    if (
      !normalizedSource ||
      !normalizedMessage
    ) {
      console.warn(
        "System log skipped: source and message are required."
      );

      return null;
    }

    const systemLog =
      await SystemLog.create({
        level: normalizeLevel(level),

        category:
          normalizeCategory(category),

        source: normalizedSource,

        message:
          normalizedMessage,

        details:
          sanitizeDetails(details),
      });

    return systemLog;
  } catch (error) {
    console.error(
      "System Logger Error:",
      error
    );

    return null;
  }
}

module.exports = systemLogger;