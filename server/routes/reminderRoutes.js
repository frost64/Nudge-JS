const express = require("express");
const {
  body,
  param,
  query,
} = require("express-validator");

const {
  completeReminder,
  createReminder,
  deleteReminder,
  getReminders,
  getUpcomingReminders,
  toggleReminder,
  updateReminder,
} = require("../controllers/reminderController");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const validate = require(
  "../middleware/validationMiddleware"
);

const router = express.Router();

const REMINDER_PRIORITIES = [
  "low",
  "medium",
  "high",
];

const REMINDER_TIME_PATTERN =
  /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Returns validation rules shared by reminder
 * creation and update routes.
 *
 * @returns {import("express-validator").ValidationChain[]}
 */
function reminderValidationRules() {
  return [
    body("title")
      .isString()
      .withMessage(
        "Title must be text."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Title is required."
      )
      .bail()
      .isLength({
        max: 200,
      })
      .withMessage(
        "Title cannot exceed 200 characters."
      ),

    body("description")
      .optional({
        nullable: true,
      })
      .isString()
      .withMessage(
        "Description must be text."
      )
      .bail()
      .trim()
      .isLength({
        max: 3000,
      })
      .withMessage(
        "Description cannot exceed 3000 characters."
      ),

    body("dueDate")
      .notEmpty()
      .withMessage(
        "Due date is required."
      )
      .bail()
      .custom((value) => {
        const dueDate = new Date(value);

        if (
          Number.isNaN(
            dueDate.getTime()
          )
        ) {
          throw new Error(
            "Due date is invalid."
          );
        }

        return true;
      }),

    body("reminderTime")
      .isString()
      .withMessage(
        "Reminder time is required."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Reminder time is required."
      )
      .bail()
      .matches(
        REMINDER_TIME_PATTERN
      )
      .withMessage(
        "Reminder time must use HH:mm format."
      ),

    body("priority")
      .isString()
      .withMessage(
        "Priority is required."
      )
      .bail()
      .trim()
      .toLowerCase()
      .isIn(
        REMINDER_PRIORITIES
      )
      .withMessage(
        "Priority must be low, medium, or high."
      ),

    body("category")
      .isString()
      .withMessage(
        "Category must be text."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Category is required."
      )
      .bail()
      .isLength({
        max: 100,
      })
      .withMessage(
        "Category cannot exceed 100 characters."
      ),
  ];
}

/*
 * Every reminder route requires authentication.
 */
router.use(authMiddleware);

/*
 * Upcoming reminders must be declared before /:id
 * so "upcoming" is not interpreted as a reminder ID.
 */
router.get(
  "/upcoming",
  getUpcomingReminders
);

/*
 * Returns the authenticated user's paginated reminders.
 */
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({
        min: 1,
      })
      .withMessage(
        "Page must be a positive integer."
      )
      .toInt(),

    query("limit")
      .optional()
      .isInt({
        min: 1,
        max: 100,
      })
      .withMessage(
        "Limit must be between 1 and 100."
      )
      .toInt(),
  ],
  validate,
  getReminders
);

/*
 * Creates a reminder.
 */
router.post(
  "/",
  reminderValidationRules(),
  validate,
  createReminder
);

/*
 * Updates a reminder.
 */
router.put(
  "/:id",
  [
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid reminder ID."
      ),

    ...reminderValidationRules(),
  ],
  validate,
  updateReminder
);

/*
 * Marks a reminder as completed.
 */
router.patch(
  "/:id/complete",
  [
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid reminder ID."
      ),
  ],
  validate,
  completeReminder
);

/*
 * Toggles a reminder's completed state.
 */
router.patch(
  "/:id/toggle",
  [
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid reminder ID."
      ),
  ],
  validate,
  toggleReminder
);

/*
 * Deletes a reminder.
 */
router.delete(
  "/:id",
  [
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid reminder ID."
      ),
  ],
  validate,
  deleteReminder
);

module.exports = router;