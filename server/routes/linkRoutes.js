const express = require("express");
const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    createLink,
    getLinks,
    updateLink,
    deleteLink,
    toggleFavoriteLink
} = require("../controllers/linkController");

router.post(
    "/",
    authMiddleware,
    createLink
);

router.get(
    "/",
    authMiddleware,
    getLinks
);

router.put(
    "/:id",
    authMiddleware,
    updateLink
);

router.delete(
    "/:id",
    authMiddleware,
    deleteLink
);

router.patch(
    "/:id/favorite",
    authMiddleware,
    toggleFavoriteLink
);

module.exports = router;