const express = require("express");
const router = express.Router();
const {
    getStats,
    getUsers,
    deleteUser,
    updateUserRole
} = require("../controllers/adminController");


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

router.delete(
    "/users/:id",
    authMiddleware,
    adminMiddleware,
    deleteUser
);

router.patch(
    "/users/:id/role",
    authMiddleware,
    adminMiddleware,
    updateUserRole
);

module.exports = router;