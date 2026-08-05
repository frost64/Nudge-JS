const express = require("express");

const {
  clearSystemLogs,
  deleteUser,
  getActivities,
  getRecentActivities,
  getRecentSuggestions,
  getStats,
  getSystemLogs,
  getSystemStatus,
  getUserGrowth,
  getUsers,
} = require("../controllers/adminController");

const {
  deleteSuggestion,
  getAllSuggestions,
  markSuggestionRead,
} = require("../controllers/suggestionController");

const adminMiddleware = require(
  "../middleware/adminMiddleware"
);

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const router = express.Router();

/*
 * Every route in this router requires a valid user session
 * and administrator privileges.
 */
router.use(
  authMiddleware,
  adminMiddleware
);

/*
 * Dashboard statistics and system status.
 */
router.get(
  "/stats",
  getStats
);

router.get(
  "/system-status",
  getSystemStatus
);

/*
 * User management.
 */
router.get(
  "/users",
  getUsers
);

router.delete(
  "/users/:id",
  deleteUser
);

/*
 * Suggestion management.
 */
router.get(
  "/suggestions",
  getAllSuggestions
);

router.get(
  "/recent-suggestions",
  getRecentSuggestions
);

router.patch(
  "/suggestions/:id/read",
  markSuggestionRead
);

router.delete(
  "/suggestions/:id",
  deleteSuggestion
);

/*
 * User growth and activity data.
 */
router.get(
  "/user-growth",
  getUserGrowth
);

router.get(
  "/recent-activities",
  getRecentActivities
);

router.get(
  "/activities",
  getActivities
);

/*
 * System log management.
 */
router.get(
  "/logs",
  getSystemLogs
);

router.delete(
  "/logs",
  clearSystemLogs
);

module.exports = router;