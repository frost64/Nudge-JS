const express = require("express");

const {
  getDashboard,
} = require("../controllers/dashboardController");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const router = express.Router();

/*
 * All dashboard routes require authentication.
 */
router.use(authMiddleware);

/*
 * Returns dashboard statistics, recent content,
 * pending reminders, overdue reminders, and birthdays.
 */
router.get(
  "/",
  getDashboard
);

module.exports = router;