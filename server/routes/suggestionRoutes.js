const express = require("express");
const router = express.Router();

const {
  createSuggestion,
  getMySuggestions,
} = require("../controllers/suggestionController");


const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/",
  authMiddleware,
  createSuggestion
);

router.get(
  "/mine",
  authMiddleware,
  getMySuggestions
);

module.exports = router;