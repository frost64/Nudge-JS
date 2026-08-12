const mongoose = require("mongoose");

const Reminder = require("../models/Reminder");
const User = require("../models/User");

const logActivity = require("../utils/activityLogger");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const UPCOMING_DAYS = 30;
const MILLISECONDS_PER_DAY =
  24 * 60 * 60 * 1000;

/**
 * Sends a consistent server-error response.
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

  if (error?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message:
        Object.values(error.errors)
          .map((item) => item.message)
          .join(" ") ||
        "Reminder validation failed.",
    });
  }

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? fallbackMessage
        : error.message || fallbackMessage,
  });
}

/**
 * Converts a query value into a bounded positive integer.
 *
 * @param {unknown} value
 * @param {number} fallback
 * @param {number} maximum
 * @returns {number}
 */
function parsePositiveInteger(
  value,
  fallback,
  maximum = Number.MAX_SAFE_INTEGER
) {
  const parsedValue = Number.parseInt(
    value,
    10
  );

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 1
  ) {
    return fallback;
  }

  return Math.min(
    parsedValue,
    maximum
  );
}

/**
 * Returns the start of the current UTC calendar day.
 *
 * @param {Date} date
 * @returns {Date}
 */
function getStartOfUtcDay(date = new Date()) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    )
  );
}

/**
 * Validates a 24-hour HH:mm time value.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isValidReminderTime(value) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(
    String(value ?? "").trim()
  );
}

/**
 * Validates and normalizes reminder request data.
 *
 * @param {object} body
 * @returns {{
 *   error: string|null,
 *   data: object|null
 * }}
 */
function validateReminderPayload(body = {}) {
  const title = String(
    body.title ?? ""
  ).trim();

  const description = String(
    body.description ?? ""
  ).trim();

  const reminderTime = String(
    body.reminderTime ?? ""
  ).trim();

  const priority = String(
    body.priority ?? ""
  ).trim();

  const category = String(
    body.category ?? ""
  ).trim();

  if (!title) {
    return {
      error: "Title is required.",
      data: null,
    };
  }

  if (!body.dueDate) {
    return {
      error: "Due date is required.",
      data: null,
    };
  }

  const dueDate = new Date(
    body.dueDate
  );

  if (Number.isNaN(dueDate.getTime())) {
    return {
      error: "Due date is invalid.",
      data: null,
    };
  }

  if (!reminderTime) {
    return {
      error:
        "Reminder time is required.",
      data: null,
    };
  }

  if (
    !isValidReminderTime(
      reminderTime
    )
  ) {
    return {
      error:
        "Reminder time must use HH:mm format.",
      data: null,
    };
  }

  if (!priority) {
    return {
      error: "Priority is required.",
      data: null,
    };
  }

  if (!category) {
    return {
      error: "Category is required.",
      data: null,
    };
  }

  return {
    error: null,
    data: {
      title,
      description,
      dueDate,
      reminderTime,
      priority,
      category,
    },
  };
}

/**
 * Records reminder activity without allowing
 * activity-log failures to break the request.
 *
 * @param {string} userId
 * @param {string} type
 * @param {string} action
 * @returns {Promise<void>}
 */
async function safelyLogReminderActivity(
  userId,
  type,
  action
) {
  try {
    const user = await User.findById(
      userId
    )
      .select("username")
      .lean();

    if (!user) {
      return;
    }

    await logActivity({
      type,
      message:
        `${user.username} ${action} a reminder`,
      user: user._id,
    });
  } catch (error) {
    console.error(
      "Failed to write reminder activity:",
      error
    );
  }
}

/**
 * Toggles the completed state of one user-owned reminder.
 */
async function toggleReminder(req, res) {
  try {
    const { id } = req.params;

    if (
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid reminder ID.",
      });
    }

    const reminder =
      await Reminder.findOne({
        _id: id,
        user: req.user.id,
      });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message:
          "Reminder not found.",
      });
    }

    reminder.completed =
      !Boolean(reminder.completed);

    await reminder.save();

    return res.status(200).json(
      reminder
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to update reminder status."
    );
  }
}

/**
 * Creates a reminder belonging to the authenticated user.
 */
async function createReminder(req, res) {
  try {
    const { error, data } =
      validateReminderPayload(
        req.body
      );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const reminder =
      await Reminder.create({
        ...data,
        user: req.user.id,
      });

    await safelyLogReminderActivity(
      req.user.id,
      "reminder_created",
      "created"
    );

    return res.status(201).json(
      reminder
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to create reminder."
    );
  }
}

/**
 * Returns the authenticated user's reminders
 * using bounded pagination.
 */
async function getReminders(req, res) {
  try {
    const page =
      parsePositiveInteger(
        req.query.page,
        DEFAULT_PAGE
      );

    const limit =
      parsePositiveInteger(
        req.query.limit,
        DEFAULT_LIMIT,
        MAX_LIMIT
      );

    const skip =
      (page - 1) * limit;

    const filter = {
      user: req.user.id,
    };

    const [reminders, total] =
      await Promise.all([
        Reminder.find(filter)
          .sort({
            dueDate: 1,
            reminderTime: 1,
            createdAt: -1,
            _id: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Reminder.countDocuments(
          filter
        ),
      ]);

    return res.status(200).json({
      page,
      limit,
      total,
      pages:
        total === 0
          ? 0
          : Math.ceil(total / limit),
      data: reminders,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to load reminders."
    );
  }
}

/**
 * Updates one reminder owned by the authenticated user.
 */
async function updateReminder(req, res) {
  try {
    const { id } = req.params;

    if (
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid reminder ID.",
      });
    }

    const { error, data } =
      validateReminderPayload(
        req.body
      );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const reminder =
      await Reminder.findOneAndUpdate(
        {
          _id: id,
          user: req.user.id,
        },
        {
          $set: data,
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message:
          "Reminder not found.",
      });
    }

    await safelyLogReminderActivity(
      req.user.id,
      "reminder_updated",
      "updated"
    );

    return res.status(200).json(
      reminder
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to update reminder."
    );
  }
}

/**
 * Deletes one reminder owned by the authenticated user.
 */
async function deleteReminder(req, res) {
  try {
    const { id } = req.params;

    if (
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid reminder ID.",
      });
    }

    const reminder =
      await Reminder.findOneAndDelete({
        _id: id,
        user: req.user.id,
      });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message:
          "Reminder not found.",
      });
    }

    await safelyLogReminderActivity(
      req.user.id,
      "reminder_deleted",
      "deleted"
    );

    return res.status(200).json({
      success: true,
      message:
        "Reminder deleted successfully.",
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to delete reminder."
    );
  }
}

/**
 * Marks one user-owned reminder as completed.
 */
async function completeReminder(
  req,
  res
) {
  try {
    const { id } = req.params;

    if (
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid reminder ID.",
      });
    }

    const reminder =
      await Reminder.findOneAndUpdate(
        {
          _id: id,
          user: req.user.id,
        },
        {
          $set: {
            completed: true,
          },
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message:
          "Reminder not found.",
      });
    }

    return res.status(200).json(
      reminder
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to complete reminder."
    );
  }
}

/**
 * Returns incomplete reminders occurring within
 * the next 30 calendar days.
 */
async function getUpcomingReminders(
  req,
  res
) {
  try {
    const today =
      getStartOfUtcDay();

    const endDate = new Date(
      today.getTime() +
        UPCOMING_DAYS *
          MILLISECONDS_PER_DAY
    );

    const reminders =
      await Reminder.find({
        user: req.user.id,
        completed: false,

        dueDate: {
          $gte: today,
          $lte: endDate,
        },
      })
        .sort({
          dueDate: 1,
          reminderTime: 1,
          createdAt: 1,
        })
        .lean();

    const upcoming = reminders.map(
      (reminder) => {
        const dueDate =
          getStartOfUtcDay(
            new Date(
              reminder.dueDate
            )
          );

        const daysRemaining =
          Math.round(
            (dueDate.getTime() -
              today.getTime()) /
              MILLISECONDS_PER_DAY
          );

        return {
          ...reminder,
          daysRemaining,
        };
      }
    );

    return res.status(200).json(
      upcoming
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to load upcoming reminders."
    );
  }
}

module.exports = {
  completeReminder,
  createReminder,
  deleteReminder,
  getReminders,
  getUpcomingReminders,
  toggleReminder,
  updateReminder,
};