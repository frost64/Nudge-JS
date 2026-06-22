const express = require("express");
const router = express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  togglePinNote,
  toggleFavoriteNote
} = require("../controllers/noteController");

router.post(
  "/",
  authMiddleware,
  createNote
);

router.get(
  "/",
  authMiddleware,
  getNotes
);

router.put(
  "/:id",
  authMiddleware,
  updateNote
);

router.delete(
  "/:id",
  authMiddleware,
  deleteNote
);

router.patch(
  "/:id/pin",
  authMiddleware,
  togglePinNote
);

router.patch(
  "/:id/favorite",
  authMiddleware,
  toggleFavoriteNote
);

module.exports = router;