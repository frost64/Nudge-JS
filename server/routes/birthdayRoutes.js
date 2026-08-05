const express = require("express");
const {
  body,
  param,
  query,
} = require("express-validator");

const {
  createBirthday,
  deleteBirthday,
  getBirthdays,
  getUpcomingBirthdays,
  updateBirthday,
} = require("../controllers/birthdayController");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const validate = require(
  "../middleware/validationMiddleware"
);

const router = express.Router();

const CURRENT_YEAR =
  new Date().getFullYear();

/**
 * Returns validation rules shared by birthday
 * creation and update routes.
 */
function birthdayValidationRules() {
  return [
    body("name")
      .isString()
      .withMessage(
        "Name must be text."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Name is required."
      )
      .bail()
      .isLength({
        max: 120,
      })
      .withMessage(
        "Name cannot exceed 120 characters."
      ),

    body("birthDay")
      .notEmpty()
      .withMessage(
        "Birth day is required."
      )
      .bail()
      .isInt({
        min: 1,
        max: 31,
      })
      .withMessage(
        "Birth day must be between 1 and 31."
      )
      .toInt(),

    body("birthMonth")
      .notEmpty()
      .withMessage(
        "Birth month is required."
      )
      .bail()
      .isInt({
        min: 1,
        max: 12,
      })
      .withMessage(
        "Birth month must be between 1 and 12."
      )
      .toInt(),

    body("birthYear")
      .optional({
        nullable: true,
        checkFalsy: true,
      })
      .isInt({
        min: 1900,
        max: CURRENT_YEAR,
      })
      .withMessage(
        `Birth year must be between 1900 and ${CURRENT_YEAR}.`
      )
      .toInt(),

    body("relationship")
      .isString()
      .withMessage(
        "Relationship must be text."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Relationship is required."
      )
      .bail()
      .isLength({
        max: 100,
      })
      .withMessage(
        "Relationship cannot exceed 100 characters."
      ),

    body("notes")
      .isString()
      .withMessage(
        "Birthday note must be text."
      )
      .bail()
      .trim()
      .notEmpty()
      .withMessage(
        "Birthday note is required."
      )
      .bail()
      .isLength({
        max: 1000,
      })
      .withMessage(
        "Birthday note cannot exceed 1000 characters."
      ),

    body().custom((value) => {
      const birthDay = Number(
        value.birthDay
      );

      const birthMonth = Number(
        value.birthMonth
      );

      const birthYear =
        value.birthYear === undefined ||
        value.birthYear === null ||
        value.birthYear === ""
          ? 2000
          : Number(value.birthYear);

      if (
        !Number.isInteger(birthDay) ||
        !Number.isInteger(birthMonth) ||
        !Number.isInteger(birthYear)
      ) {
        return true;
      }

      const date = new Date(
        Date.UTC(
          birthYear,
          birthMonth - 1,
          birthDay
        )
      );

      const validDate =
        date.getUTCFullYear() ===
          birthYear &&
        date.getUTCMonth() ===
          birthMonth - 1 &&
        date.getUTCDate() === birthDay;

      if (!validDate) {
        throw new Error(
          "The supplied birth date is invalid."
        );
      }

      return true;
    }),
  ];
}

/*
 * All birthday routes require authentication.
 */
router.use(authMiddleware);

/*
 * Upcoming birthdays must be declared before /:id
 * so Express does not treat "upcoming" as an ID.
 */
router.get(
  "/upcoming",
  getUpcomingBirthdays
);

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
  getBirthdays
);

router.post(
  "/",
  birthdayValidationRules(),
  validate,
  createBirthday
);

router.put(
  "/:id",
  [
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid birthday ID."
      ),

    ...birthdayValidationRules(),
  ],
  validate,
  updateBirthday
);

router.delete(
  "/:id",
  [
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid birthday ID."
      ),
  ],
  validate,
  deleteBirthday
);

module.exports = router;