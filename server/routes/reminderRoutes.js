const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  completeReminder,
  getUpcomingReminders,
  toggleReminder
} = require("../controllers/reminderController");

router.post(
  "/",
  authMiddleware,
  createReminder
);

router.get(
  "/",
  authMiddleware,
  getReminders
);

router.get(
    "/upcoming",
    authMiddleware,
    getUpcomingReminders
);

router.put(
  "/:id",
  authMiddleware,
  updateReminder
);

router.delete(
  "/:id",
  authMiddleware,
  deleteReminder
);

router.patch(
  "/:id/complete",
  authMiddleware,
  completeReminder
);

router.patch(
  "/:id/toggle",
  authMiddleware,
  toggleReminder
);

module.exports = router;