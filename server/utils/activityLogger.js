const Activity = require("../models/Activity");

const DEFAULT_ACTIVITY_CONFIG =
  Object.freeze({
    icon: "FaCircle",
    color: "#38bdf8",
  });

const activityConfig = Object.freeze({
  user_registered: {
    icon: "FaUserPlus",
    color: "#22c55e",
  },

  user_login: {
    icon: "FaSignInAlt",
    color: "#38bdf8",
  },

  user_deleted: {
    icon: "FaUserMinus",
    color: "#ef4444",
  },

  password_updated: {
    icon: "FaLock",
    color: "#f59e0b",
  },

  password_reset: {
    icon: "FaKey",
    color: "#22c55e",
  },

  note_created: {
    icon: "FaStickyNote",
    color: "#38bdf8",
  },

  note_updated: {
    icon: "FaStickyNote",
    color: "#f59e0b",
  },

  note_deleted: {
    icon: "FaTrash",
    color: "#ef4444",
  },

  reminder_created: {
    icon: "FaBell",
    color: "#22c55e",
  },

  reminder_updated: {
    icon: "FaBell",
    color: "#f59e0b",
  },

  reminder_deleted: {
    icon: "FaTrash",
    color: "#ef4444",
  },

  birthday_created: {
    icon: "FaBirthdayCake",
    color: "#ec4899",
  },

  birthday_updated: {
    icon: "FaBirthdayCake",
    color: "#f59e0b",
  },

  birthday_deleted: {
    icon: "FaTrash",
    color: "#ef4444",
  },

  link_created: {
    icon: "FaLink",
    color: "#0ea5e9",
  },

  link_updated: {
    icon: "FaLink",
    color: "#f59e0b",
  },

  link_deleted: {
    icon: "FaTrash",
    color: "#ef4444",
  },

  suggestion_created: {
    icon: "FaLightbulb",
    color: "#fbbf24",
  },

  /*
   * Retained for compatibility with older activity records
   * or controllers that used the previous event name.
   */
  suggestion_submitted: {
    icon: "FaLightbulb",
    color: "#fbbf24",
  },
});

/**
 * Normalizes a value into trimmed text.
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeText(value) {
  return String(value ?? "").trim();
}

/**
 * Writes an activity record.
 *
 * Logging errors are contained so an activity-log failure
 * does not break the original API request.
 *
 * @param {object} activity
 * @param {string} activity.type
 * @param {string} activity.message
 * @param {string|object|null} [activity.user]
 * @param {string} [activity.performedBy]
 * @returns {Promise<object|null>}
 */
async function logActivity({
  type,
  message,
  user = null,
  performedBy = "",
} = {}) {
  try {
    const normalizedType =
      normalizeText(type);

    const normalizedMessage =
      normalizeText(message);

    const normalizedPerformedBy =
      normalizeText(performedBy);

    if (
      !normalizedType ||
      !normalizedMessage
    ) {
      console.warn(
        "Activity log skipped: type and message are required."
      );

      return null;
    }

    const config =
      activityConfig[normalizedType] ||
      DEFAULT_ACTIVITY_CONFIG;

    const activity =
      await Activity.create({
        type: normalizedType,
        message: normalizedMessage,
        icon: config.icon,
        color: config.color,
        user: user || null,
        performedBy:
          normalizedPerformedBy,
      });

    return activity;
  } catch (error) {
    console.error(
      "Activity Log Error:",
      error
    );

    return null;
  }
}

module.exports = logActivity;