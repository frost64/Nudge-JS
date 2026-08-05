const Birthday = require("../models/Birthday");
const Link = require("../models/Link");
const Note = require("../models/Note");
const Reminder = require("../models/Reminder");

const DASHBOARD_ITEM_LIMIT = 5;
const MILLISECONDS_PER_DAY =
  24 * 60 * 60 * 1000;

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
 * Returns the start of the current UTC calendar day.
 *
 * Using UTC prevents dashboard results from changing
 * based on the deployment server's local timezone.
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
 * Calculates the next occurrence of a recurring birthday.
 *
 * @param {object} birthday
 * @param {Date} today
 * @returns {(object & {daysRemaining: number}) | null}
 */
function calculateUpcomingBirthday(
  birthday,
  today
) {
  const birthDay = Number(
    birthday.birthDay
  );

  const birthMonth = Number(
    birthday.birthMonth
  );

  if (
    !Number.isInteger(birthDay) ||
    birthDay < 1 ||
    birthDay > 31 ||
    !Number.isInteger(birthMonth) ||
    birthMonth < 1 ||
    birthMonth > 12
  ) {
    return null;
  }

  const currentYear =
    today.getUTCFullYear();

  let nextBirthday = new Date(
    Date.UTC(
      currentYear,
      birthMonth - 1,
      birthDay
    )
  );

  if (nextBirthday < today) {
    nextBirthday = new Date(
      Date.UTC(
        currentYear + 1,
        birthMonth - 1,
        birthDay
      )
    );
  }

  const daysRemaining = Math.round(
    (nextBirthday.getTime() -
      today.getTime()) /
      MILLISECONDS_PER_DAY
  );

  return {
    ...birthday,
    daysRemaining,
  };
}

/**
 * Returns the five nearest upcoming birthdays.
 *
 * @param {object[]} birthdays
 * @param {Date} today
 * @returns {object[]}
 */
function getNearestBirthdays(
  birthdays,
  today
) {
  return birthdays
    .map((birthday) =>
      calculateUpcomingBirthday(
        birthday,
        today
      )
    )
    .filter(Boolean)
    .sort(
      (first, second) =>
        first.daysRemaining -
          second.daysRemaining ||
        String(first.name).localeCompare(
          String(second.name)
        )
    )
    .slice(0, DASHBOARD_ITEM_LIMIT);
}

/**
 * Returns dashboard statistics and recent user content.
 */
async function getDashboard(req, res) {
  try {
    const userId = req.user.id;
    const today = getStartOfUtcDay();

    const reminderFilter = {
      user: userId,
    };

    const birthdayFilter = {
      user: userId,
    };

    const noteFilter = {
      user: userId,
    };

    const linkFilter = {
      user: userId,
    };

    const [
      totalReminders,
      totalBirthdays,
      totalNotes,
      totalLinks,
      recentNotes,
      favoriteLinks,
      pendingReminders,
      overdueReminders,
      birthdays,
    ] = await Promise.all([
      Reminder.countDocuments(
        reminderFilter
      ),

      Birthday.countDocuments(
        birthdayFilter
      ),

      Note.countDocuments(noteFilter),

      Link.countDocuments(linkFilter),

      Note.find(noteFilter)
        .sort({
          createdAt: -1,
        })
        .limit(DASHBOARD_ITEM_LIMIT)
        .lean(),

      Link.find({
        ...linkFilter,
        favorite: true,
      })
        .sort({
          updatedAt: -1,
          createdAt: -1,
        })
        .limit(DASHBOARD_ITEM_LIMIT)
        .lean(),

      Reminder.find({
        ...reminderFilter,
        completed: false,
        dueDate: {
          $gte: today,
        },
      })
        .sort({
          dueDate: 1,
          reminderTime: 1,
          createdAt: 1,
        })
        .limit(DASHBOARD_ITEM_LIMIT)
        .lean(),

      Reminder.find({
        ...reminderFilter,
        completed: false,
        dueDate: {
          $lt: today,
        },
      })
        .sort({
          dueDate: 1,
          reminderTime: 1,
          createdAt: 1,
        })
        .limit(DASHBOARD_ITEM_LIMIT)
        .lean(),

      Birthday.find(birthdayFilter)
        .select(
          "-__v"
        )
        .lean(),
    ]);

    const upcomingBirthdays =
      getNearestBirthdays(
        birthdays,
        today
      );

    return res.status(200).json({
      stats: {
        totalReminders,
        totalBirthdays,
        totalNotes,
        totalLinks,
      },

      recentNotes,
      favoriteLinks,
      pendingReminders,
      overdueReminders,
      upcomingBirthdays,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to load dashboard."
    );
  }
}

module.exports = {
  getDashboard,
};