const mongoose = require("mongoose");

const PRIORITIES = [
  "low",
  "medium",
  "high",
];

const REMINDER_TIME_PATTERN =
  /^([01]\d|2[0-3]):([0-5]\d)$/;

const reminderSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: [
          true,
          "Title is required.",
        ],
        trim: true,
        minlength: [
          1,
          "Title is required.",
        ],
        maxlength: [
          200,
          "Title cannot exceed 200 characters.",
        ],
      },

      description: {
        type: String,
        trim: true,
        maxlength: [
          3000,
          "Description cannot exceed 3000 characters.",
        ],
        default: "",
      },

      dueDate: {
        type: Date,
        required: [
          true,
          "Due date is required.",
        ],
        validate: {
          validator(value) {
            return (
              value instanceof Date &&
              !Number.isNaN(
                value.getTime()
              )
            );
          },
          message:
            "Due date is invalid.",
        },
      },

      reminderTime: {
        type: String,
        required: [
          true,
          "Reminder time is required.",
        ],
        trim: true,
        default: "09:00",
        match: [
          REMINDER_TIME_PATTERN,
          "Reminder time must use HH:mm format.",
        ],
      },

      priority: {
        type: String,
        required: [
          true,
          "Priority is required.",
        ],
        trim: true,
        lowercase: true,
        enum: {
          values: PRIORITIES,
          message:
            "Priority must be low, medium, or high.",
        },
        default: "medium",
      },

      category: {
        type: String,
        required: [
          true,
          "Category is required.",
        ],
        trim: true,
        minlength: [
          1,
          "Category is required.",
        ],
        maxlength: [
          100,
          "Category cannot exceed 100 characters.",
        ],
        default: "General",
      },

      completed: {
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
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

/*
 * Supports paginated reminder lists ordered by due date.
 */
reminderSchema.index({
  user: 1,
  dueDate: 1,
  reminderTime: 1,
});

/*
 * Supports dashboard, upcoming, and overdue queries.
 */
reminderSchema.index({
  user: 1,
  completed: 1,
  dueDate: 1,
  reminderTime: 1,
});

/*
 * Supports category filtering and autocomplete.
 */
reminderSchema.index({
  user: 1,
  category: 1,
});

module.exports =
  mongoose.models.Reminder ||
  mongoose.model(
    "Reminder",
    reminderSchema
  );