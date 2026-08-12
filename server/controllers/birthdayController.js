const mongoose = require("mongoose");

const Birthday = require("../models/Birthday");
const User = require("../models/User");

const logActivity = require("../utils/activityLogger");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const UPCOMING_DAYS = 30;
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
 * Converts a value into a bounded positive integer.
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
 * Checks whether a supplied birthday date is valid.
 *
 * A leap year is used when birthYear is absent so
 * February 29 remains a valid recurring birthday.
 *
 * @param {number} day
 * @param {number} month
 * @param {number|null} year
 * @returns {boolean}
 */
function isValidBirthdayDate(
  day,
  month,
  year
) {
  const validationYear =
    year || 2000;

  const date = new Date(
    Date.UTC(
      validationYear,
      month - 1,
      day
    )
  );

  return (
    date.getUTCFullYear() ===
      validationYear &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Validates and normalizes birthday request data.
 *
 * @param {object} body
 * @returns {{
 *   error: string|null,
 *   data: object|null
 * }}
 */
function validateBirthdayPayload(body) {
  const name = String(
    body.name ?? ""
  ).trim();

  const relationship = String(
    body.relationship ?? ""
  ).trim();

  const notes = String(
    body.notes ?? ""
  ).trim();

  const birthDay = Number(
    body.birthDay
  );

  const birthMonth = Number(
    body.birthMonth
  );

  const birthYear =
    body.birthYear === undefined ||
    body.birthYear === null ||
    body.birthYear === ""
      ? null
      : Number(body.birthYear);

  if (!name) {
    return {
      error: "Name is required.",
      data: null,
    };
  }

  if (
    !Number.isInteger(birthDay) ||
    birthDay < 1 ||
    birthDay > 31
  ) {
    return {
      error:
        "Birth day must be between 1 and 31.",
      data: null,
    };
  }

  if (
    !Number.isInteger(birthMonth) ||
    birthMonth < 1 ||
    birthMonth > 12
  ) {
    return {
      error:
        "Birth month must be between 1 and 12.",
      data: null,
    };
  }

  if (
    birthYear !== null &&
    (
      !Number.isInteger(birthYear) ||
      birthYear < 1900 ||
      birthYear >
        new Date().getFullYear()
    )
  ) {
    return {
      error:
        "Birth year is invalid.",
      data: null,
    };
  }

  if (
    !isValidBirthdayDate(
      birthDay,
      birthMonth,
      birthYear
    )
  ) {
    return {
      error:
        "The supplied birth date is invalid.",
      data: null,
    };
  }

  if (!relationship) {
    return {
      error:
        "Relationship is required.",
      data: null,
    };
  }

  if (!notes) {
    return {
      error:
        "Birthday note is required.",
      data: null,
    };
  }

  return {
    error: null,
    data: {
      name,
      birthDay,
      birthMonth,
      birthYear,
      relationship,
      notes,
    },
  };
}

/**
 * Records birthday activity without allowing logging
 * failures to break the main request.
 *
 * @param {string} userId
 * @param {string} type
 * @param {string} action
 * @returns {Promise<void>}
 */
async function safelyLogBirthdayActivity(
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
        `${user.username} ${action} a birthday`,
      user: user._id,
    });
  } catch (error) {
    console.error(
      "Failed to write birthday activity:",
      error
    );
  }
}

/**
 * Creates a birthday belonging to the authenticated user.
 */
async function createBirthday(req, res) {
  try {
    const { error, data } =
      validateBirthdayPayload(
        req.body
      );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const birthday =
      await Birthday.create({
        ...data,
        user: req.user.id,
      });

    await safelyLogBirthdayActivity(
      req.user.id,
      "birthday_created",
      "created"
    );

    return res.status(201).json(
      birthday
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to create birthday."
    );
  }
}

/**
 * Returns the authenticated user's birthdays
 * using bounded pagination.
 */
async function getBirthdays(req, res) {
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

    const [birthdays, total] =
      await Promise.all([
        Birthday.find(filter)
          .sort({
            birthMonth: 1,
            birthDay: 1,
            name: 1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Birthday.countDocuments(
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
      data: birthdays,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to load birthdays."
    );
  }
}

/**
 * Updates one birthday owned by the authenticated user.
 */
async function updateBirthday(req, res) {
  try {
    const { id } = req.params;

    if (
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid birthday ID.",
      });
    }

    const { error, data } =
      validateBirthdayPayload(
        req.body
      );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const birthday =
      await Birthday.findOneAndUpdate(
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

    if (!birthday) {
      return res.status(404).json({
        success: false,
        message:
          "Birthday not found.",
      });
    }

    await safelyLogBirthdayActivity(
      req.user.id,
      "birthday_updated",
      "updated"
    );

    return res.status(200).json(
      birthday
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to update birthday."
    );
  }
}

/**
 * Deletes one birthday owned by the authenticated user.
 */
async function deleteBirthday(req, res) {
  try {
    const { id } = req.params;

    if (
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid birthday ID.",
      });
    }

    const birthday =
      await Birthday.findOneAndDelete({
        _id: id,
        user: req.user.id,
      });

    if (!birthday) {
      return res.status(404).json({
        success: false,
        message:
          "Birthday not found.",
      });
    }

    await safelyLogBirthdayActivity(
      req.user.id,
      "birthday_deleted",
      "deleted"
    );

    return res.status(200).json({
      success: true,
      message:
        "Birthday deleted successfully.",
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to delete birthday."
    );
  }
}

/**
 * Returns birthdays occurring within the next 30 days.
 */
async function getUpcomingBirthdays(
  req,
  res
) {
  try {
    const birthdays =
      await Birthday.find({
        user: req.user.id,
      }).lean();

    const now = new Date();

    const todayUtc = Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const currentYear =
      now.getFullYear();

    const upcoming = birthdays
      .map((birthday) => {
        let nextBirthdayUtc =
          Date.UTC(
            currentYear,
            birthday.birthMonth - 1,
            birthday.birthDay
          );

        if (
          nextBirthdayUtc < todayUtc
        ) {
          nextBirthdayUtc =
            Date.UTC(
              currentYear + 1,
              birthday.birthMonth - 1,
              birthday.birthDay
            );
        }

        const daysRemaining =
          Math.round(
            (
              nextBirthdayUtc -
              todayUtc
            ) /
              MILLISECONDS_PER_DAY
          );

        return {
          ...birthday,
          daysRemaining,
        };
      })
      .filter(
        ({ daysRemaining }) =>
          daysRemaining >= 0 &&
          daysRemaining <=
            UPCOMING_DAYS
      )
      .sort(
        (first, second) =>
          first.daysRemaining -
            second.daysRemaining ||
          first.name.localeCompare(
            second.name
          )
      );

    return res.status(200).json(
      upcoming
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to load upcoming birthdays."
    );
  }
}

module.exports = {
  createBirthday,
  deleteBirthday,
  getBirthdays,
  getUpcomingBirthdays,
  updateBirthday,
};