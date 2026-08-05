const mongoose = require("mongoose");

const MINIMUM_BIRTH_YEAR = 1900;

/**
 * Checks whether the supplied day, month, and optional year
 * form a valid calendar date.
 *
 * Year 2000 is used when no birth year is supplied so that
 * February 29 remains valid for recurring birthdays.
 *
 * @param {number} day
 * @param {number} month
 * @param {number|null} year
 * @returns {boolean}
 */
function isValidBirthDate(
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

const birthdaySchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: [
          true,
          "Name is required.",
        ],
        trim: true,
        minlength: [
          1,
          "Name is required.",
        ],
        maxlength: [
          120,
          "Name cannot exceed 120 characters.",
        ],
      },

      birthDay: {
        type: Number,
        required: [
          true,
          "Birth day is required.",
        ],
        min: [
          1,
          "Birth day must be between 1 and 31.",
        ],
        max: [
          31,
          "Birth day must be between 1 and 31.",
        ],
      },

      birthMonth: {
        type: Number,
        required: [
          true,
          "Birth month is required.",
        ],
        min: [
          1,
          "Birth month must be between 1 and 12.",
        ],
        max: [
          12,
          "Birth month must be between 1 and 12.",
        ],
      },

      birthYear: {
        type: Number,
        default: null,

        validate: {
          validator(value) {
            if (
              value === null ||
              value === undefined
            ) {
              return true;
            }

            return (
              Number.isInteger(value) &&
              value >=
                MINIMUM_BIRTH_YEAR &&
              value <=
                new Date().getFullYear()
            );
          },

          message:
            "Birth year is invalid.",
        },
      },

      relationship: {
        type: String,
        required: [
          true,
          "Relationship is required.",
        ],
        trim: true,
        minlength: [
          1,
          "Relationship is required.",
        ],
        maxlength: [
          100,
          "Relationship cannot exceed 100 characters.",
        ],
      },

      notes: {
        type: String,
        required: [
          true,
          "Birthday note is required.",
        ],
        trim: true,
        minlength: [
          1,
          "Birthday note is required.",
        ],
        maxlength: [
          1000,
          "Birthday note cannot exceed 1000 characters.",
        ],
      },

      favorites: {
        type: Boolean,
        default: false,
      },

      user: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: [
          true,
          "User is required.",
        ],
        index: true,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

/*
 * Validates calendar combinations such as February 30.
 */
birthdaySchema.pre(
  "validate",
  function validateBirthdayDate(next) {
    if (
      this.birthDay === undefined ||
      this.birthMonth === undefined
    ) {
      return next();
    }

    const validDate =
      isValidBirthDate(
        this.birthDay,
        this.birthMonth,
        this.birthYear
      );

    if (!validDate) {
      this.invalidate(
        "birthDay",
        "The supplied birth date is invalid."
      );
    }

    return next();
  }
);

/*
 * Supports birthday lists sorted by recurring date.
 */
birthdaySchema.index({
  user: 1,
  birthMonth: 1,
  birthDay: 1,
  name: 1,
});

/*
 * Supports recent birthday records for one user.
 */
birthdaySchema.index({
  user: 1,
  createdAt: -1,
});

module.exports =
  mongoose.models.Birthday ||
  mongoose.model(
    "Birthday",
    birthdaySchema
  );