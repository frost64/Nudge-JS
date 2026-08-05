const mongoose = require("mongoose");

const Activity = require("../models/Activity");
const Birthday = require("../models/Birthday");
const Link = require("../models/Link");
const Note = require("../models/Note");
const Reminder = require("../models/Reminder");
const Suggestion = require("../models/Suggestion");
const SystemLog = require("../models/SystemLog");
const User = require("../models/User");

const logActivity = require("../utils/activityLogger");

const SYSTEM_LOG_LIMIT = 200;
const RECENT_ITEM_LIMIT = 6;
const USER_GROWTH_MONTHS = 12;

const VALID_LOG_LEVELS = new Set([
  "success",
  "info",
  "warning",
  "error",
]);

/**
 * Sends a consistent internal-server-error response.
 *
 * @param {import("express").Response} res
 * @param {Error} error
 * @param {string} fallbackMessage
 * @returns {import("express").Response}
 */
function sendServerError(
  res,
  error,
  fallbackMessage = "Internal server error."
) {
  console.error(error);

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? fallbackMessage
        : error.message || fallbackMessage,
  });
}

/**
 * Formats an activity timestamp for the admin dashboard.
 *
 * @param {Date|string} value
 * @returns {string}
 */
function formatActivityTime(value) {
  const createdAt = new Date(value);

  if (Number.isNaN(createdAt.getTime())) {
    return "Unknown";
  }

  const now = new Date();

  const differenceInMinutes = Math.max(
    0,
    Math.floor(
      (now.getTime() - createdAt.getTime()) /
        (1000 * 60)
    )
  );

  if (differenceInMinutes < 1) {
    return "Just now";
  }

  if (differenceInMinutes < 60) {
    return `${differenceInMinutes}m ago`;
  }

  const formattedTime =
    createdAt.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

  const formattedDate =
    createdAt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return `${formattedTime} • ${formattedDate}`;
}

/**
 * Returns application-wide document statistics.
 */
async function getStats(req, res) {
  try {
    const [
      users,
      notes,
      reminders,
      birthdays,
      links,
    ] = await Promise.all([
      User.countDocuments(),
      Note.countDocuments(),
      Reminder.countDocuments(),
      Birthday.countDocuments(),
      Link.countDocuments(),
    ]);

    return res.json({
      users,
      notes,
      reminders,
      birthdays,
      links,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to load statistics."
    );
  }
}

/**
 * Returns the most recent system logs.
 */
async function getSystemLogs(req, res) {
  try {
    const logs = await SystemLog.find()
      .sort({ createdAt: -1 })
      .limit(SYSTEM_LOG_LIMIT)
      .lean();

    return res.json(logs);
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to load system logs."
    );
  }
}

/**
 * Clears all system logs or logs matching one level.
 */
async function clearSystemLogs(req, res) {
  try {
    const requestedLevel = String(
      req.query.level || "all"
    ).toLowerCase();

    if (
      requestedLevel !== "all" &&
      !VALID_LOG_LEVELS.has(requestedLevel)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid log level.",
      });
    }

    const filter =
      requestedLevel === "all"
        ? {}
        : {
            level: requestedLevel,
          };

    const result =
      await SystemLog.deleteMany(filter);

    return res.json({
      success: true,
      deletedCount: result.deletedCount,
      message:
        requestedLevel === "all"
          ? "All logs cleared successfully."
          : `${requestedLevel} logs cleared successfully.`,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to clear system logs."
    );
  }
}

/**
 * Returns all standard users without sensitive fields.
 */
async function getUsers(req, res) {
  try {
    const users = await User.find({
      role: "user",
    })
      .select(
        "-password -resetPasswordToken -resetPasswordExpire"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.json(users);
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to load users."
    );
  }
}

/**
 * Deletes a user and all records owned by that user.
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(id).select(
      "_id username role"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Administrator accounts cannot be deleted from this endpoint.",
      });
    }

    await Promise.all([
      Note.deleteMany({
        user: user._id,
      }),
      Reminder.deleteMany({
        user: user._id,
      }),
      Birthday.deleteMany({
        user: user._id,
      }),
      Link.deleteMany({
        user: user._id,
      }),
      Suggestion.deleteMany({
        user: user._id,
      }),
      Activity.deleteMany({
        user: user._id,
      }),
    ]);

    /*
     * Log before deleting the user so activityLogger can
     * still resolve the referenced account if necessary.
     */
    try {
      await logActivity({
        type: "user_deleted",
        message: `Admin deleted ${user.username}`,
        user: user._id,
      });
    } catch (loggingError) {
      console.error(
        "Failed to record user-deletion activity:",
        loggingError
      );
    }

    await user.deleteOne();

    return res.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to delete user."
    );
  }
}

/**
 * Returns the current status of core application services.
 */
async function getSystemStatus(req, res) {
  try {
    const databaseConnected =
      mongoose.connection.readyState === 1;

    const services = [
      {
        name: "Database",
        status: databaseConnected
          ? "Operational"
          : "Offline",
      },
      {
        name: "API Server",
        status: "Operational",
      },
      {
        name: "Authentication",
        status: process.env.JWT_SECRET
          ? "Operational"
          : "Offline",
      },
      {
        name: "Notes",
        status: Note
          ? "Operational"
          : "Offline",
      },
      {
        name: "Links",
        status: Link
          ? "Operational"
          : "Offline",
      },
      {
        name: "Reminders",
        status: Reminder
          ? "Operational"
          : "Offline",
      },
      {
        name: "Birthdays",
        status: Birthday
          ? "Operational"
          : "Offline",
      },
    ];

    return res.json(services);
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to load system status."
    );
  }
}

/**
 * Returns the newest user suggestions.
 */
async function getRecentSuggestions(req, res) {
  try {
    const suggestions =
      await Suggestion.find()
        .sort({ createdAt: -1 })
        .limit(RECENT_ITEM_LIMIT)
        .lean();

    return res.json(suggestions);
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to load recent suggestions."
    );
  }
}

/**
 * Returns cumulative user growth for the last 12 months.
 */
async function getUserGrowth(req, res) {
  try {
    const now = new Date();

    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() -
        (USER_GROWTH_MONTHS - 1),
      1
    );

    const usersBeforePeriod =
      await User.countDocuments({
        createdAt: {
          $lt: startDate,
        },
      });

    const monthlyRegistrations =
      await User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt",
              },
              month: {
                $month: "$createdAt",
              },
            },
            users: {
              $sum: 1,
            },
          },
        },
      ]);

    const registrationMap = new Map(
      monthlyRegistrations.map(
        (entry) => [
          `${entry._id.year}-${entry._id.month}`,
          entry.users,
        ]
      )
    );

    let cumulativeUsers =
      usersBeforePeriod;

    const growth = Array.from(
      {
        length: USER_GROWTH_MONTHS,
      },
      (_, index) => {
        const date = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + index,
          1
        );

        const key = `${
          date.getFullYear()
        }-${date.getMonth() + 1}`;

        cumulativeUsers +=
          registrationMap.get(key) || 0;

        return {
          month: date.toLocaleString(
            "default",
            {
              month: "short",
            }
          ),
          year: date.getFullYear(),
          users: cumulativeUsers,
        };
      }
    );

    return res.json(growth);
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to load user growth."
    );
  }
}

/**
 * Returns the six most recent activity records.
 */
async function getRecentActivities(req, res) {
  try {
    const activities =
      await Activity.find()
        .sort({ createdAt: -1 })
        .limit(RECENT_ITEM_LIMIT)
        .lean();

    return res.json(activities);
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to load recent activities."
    );
  }
}

/**
 * Returns all activities with display-ready timestamps.
 */
async function getActivities(req, res) {
  try {
    const activities =
      await Activity.find()
        .sort({ createdAt: -1 })
        .lean();

    const formattedActivities =
      activities.map((activity) => ({
        ...activity,
        time: formatActivityTime(
          activity.createdAt
        ),
        timestamp: activity.createdAt,
      }));

    return res.json(
      formattedActivities
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to load activities."
    );
  }
}

module.exports = {
  clearSystemLogs,
  deleteUser,
  getActivities,
  getRecentActivities,
  getRecentSuggestions,
  getStats,
  getSystemLogs,
  getSystemStatus,
  getUserGrowth,
  getUsers,
};