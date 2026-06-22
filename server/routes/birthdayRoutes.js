const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createBirthday,
  getBirthdays,
  updateBirthday,
  deleteBirthday,
  getUpcomingBirthdays
} = require("../controllers/birthdayController");

router.post(
  "/",
  authMiddleware,
  createBirthday
);

router.get(
  "/",
  authMiddleware,
  getBirthdays
);

router.get(
    "/upcoming",
    authMiddleware,
    getUpcomingBirthdays
);

router.put(
  "/:id",
  authMiddleware,
  updateBirthday
);

router.delete(
  "/:id",
  authMiddleware,
  deleteBirthday
);

module.exports = router;