const express = require("express");
const router = express.Router();
const {
    getStats,
    getUsers,
    deleteUser,
    getSystemStatus,
    getRecentSuggestions,
    getUserGrowth,
    getRecentActivities,
    getActivities,
    getSystemLogs,
    clearSystemLogs,
} = require("../controllers/adminController");

const {
    getAllSuggestions,
    markSuggestionRead,
    deleteSuggestion,
} = require("../controllers/suggestionController");


const authMiddleware =
    require("../middleware/authMiddleware");

const adminMiddleware =
    require("../middleware/adminMiddleware");


router.get(
    "/stats",
    authMiddleware,
    adminMiddleware,
    getStats
);

router.get(
    "/users",
    authMiddleware,
    adminMiddleware,
    getUsers
);

router.get(
    "/system-status",
    authMiddleware,
    adminMiddleware,
    getSystemStatus
);

router.delete(
    "/users/:id",
    authMiddleware,
    adminMiddleware,
    deleteUser
);

router.get(
    "/suggestions",
    authMiddleware,
    adminMiddleware,
    getAllSuggestions
);

router.patch(
    "/suggestions/:id/read",
    authMiddleware,
    adminMiddleware,
    markSuggestionRead
);

router.delete(
    "/suggestions/:id",
    authMiddleware,
    adminMiddleware,
    deleteSuggestion
);

router.get(
  "/recent-suggestions",
  authMiddleware,
  adminMiddleware,
  getRecentSuggestions
);

router.get(
  "/user-growth",
  authMiddleware,
  adminMiddleware,
  getUserGrowth
);

router.get(
  "/recent-activities",
  authMiddleware,
  adminMiddleware,
  getRecentActivities
);

router.get(
  "/activities",
  authMiddleware,
  adminMiddleware,
  getActivities
);

router.get(
  "/logs",
  authMiddleware,
  adminMiddleware,
  getSystemLogs
);

router.delete(
    "/logs",
    authMiddleware,
    adminMiddleware,
    clearSystemLogs
);

module.exports = router;