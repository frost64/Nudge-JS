const mongoose = require("mongoose");
const { createEvent } = require("ics");

const Reminder = require("../models/Reminder");

const DEFAULT_EVENT_DURATION_HOURS = 1;

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
 * Parses a 24-hour HH:mm value.
 *
 * @param {unknown} value
 * @returns {{ hours: number, minutes: number } | null}
 */
function parseReminderTime(value) {
  const time = String(value ?? "").trim();

  const match = time.match(
    /^([01]\d|2[0-3]):([0-5]\d)$/
  );

  if (!match) {
    return null;
  }

  return {
    hours: Number(match[1]),
    minutes: Number(match[2]),
  };
}

/**
 * Produces a safe calendar filename.
 *
 * @param {unknown} title
 * @returns {string}
 */
function createSafeFilename(title) {
  const sanitizedTitle = String(
    title || "reminder"
  )
    .replace(/[\r\n]/g, "")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);

  return `${sanitizedTitle || "reminder"}.ics`;
}

/**
 * Converts the callback-based ics API into a promise.
 *
 * @param {object} event
 * @returns {Promise<string>}
 */
function generateCalendarEvent(event) {
  return new Promise((resolve, reject) => {
    createEvent(
      event,
      (error, value) => {
        if (error) {
          reject(
            new Error(
              error.message ||
                "Failed to generate calendar event."
            )
          );

          return;
        }

        if (!value) {
          reject(
            new Error(
              "Calendar event generation returned no data."
            )
          );

          return;
        }

        resolve(value);
      }
    );
  });
}

/**
 * Exports one reminder owned by the authenticated user
 * as an iCalendar (.ics) file.
 */
async function exportReminder(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reminder ID.",
      });
    }

    const reminder = await Reminder.findOne({
      _id: id,
      user: req.user.id,
    }).lean();

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found.",
      });
    }

    const dueDate = new Date(
      reminder.dueDate
    );

    if (
      Number.isNaN(dueDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Reminder has an invalid due date.",
      });
    }

    const parsedTime = parseReminderTime(
      reminder.reminderTime
    );

    if (!parsedTime) {
      return res.status(400).json({
        success: false,
        message:
          "Reminder has an invalid reminder time.",
      });
    }

    const event = {
      title:
        String(reminder.title || "")
          .trim() || "Reminder",

      description: String(
        reminder.description || ""
      ).trim(),

      start: [
        dueDate.getUTCFullYear(),
        dueDate.getUTCMonth() + 1,
        dueDate.getUTCDate(),
        parsedTime.hours,
        parsedTime.minutes,
      ],

      startInputType: "local",
      startOutputType: "local",

      duration: {
        hours:
          DEFAULT_EVENT_DURATION_HOURS,
      },

      status: "CONFIRMED",
      busyStatus: "BUSY",

      productId:
        "nudge-productivity-app",
    };

    const calendarData =
      await generateCalendarEvent(event);

    const filename =
      createSafeFilename(
        reminder.title
      );

    const encodedFilename =
      encodeURIComponent(filename);

    res.setHeader(
      "Content-Type",
      "text/calendar; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    return res.status(200).send(
      calendarData
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to export reminder."
    );
  }
}

module.exports = {
  exportReminder,
};