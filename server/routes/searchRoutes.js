const express = require("express");
const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    globalSearch,
    getSuggestions
} = require("../controllers/searchController");

router.get(
    "/suggestions",
    authMiddleware,
    getSuggestions
);

router.get(
    "/",
    authMiddleware,
    globalSearch
);

module.exports = router;