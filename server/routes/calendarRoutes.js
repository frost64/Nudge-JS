const express = require("express");
const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    exportReminder
} = require("../controllers/calendarController");

router.get(
    "/reminder/:id",
    authMiddleware,
    exportReminder
);

module.exports = router;