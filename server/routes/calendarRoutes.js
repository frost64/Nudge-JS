const express = require("express");
const {
  param,
} = require("express-validator");

const {
  exportReminder,
} = require("../controllers/calendarController");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const validate = require(
  "../middleware/validationMiddleware"
);

const router = express.Router();

/*
 * All calendar export routes require authentication.
 */
router.use(authMiddleware);

/*
 * Exports one user-owned reminder as an .ics file.
 */
router.get(
  "/reminder/:id",
  [
    param("id")
      .isMongoId()
      .withMessage(
        "Invalid reminder ID."
      ),
  ],
  validate,
  exportReminder
);

module.exports = router;