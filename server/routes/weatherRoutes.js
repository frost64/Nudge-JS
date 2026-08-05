const express = require("express");
const {
  query,
} = require("express-validator");

const {
  getWeather,
} = require("../controllers/weatherController");

const validate = require(
  "../middleware/validationMiddleware"
);

const router = express.Router();

/**
 * Returns the current weather for valid geographic coordinates.
 *
 * This route remains public to preserve the existing API behavior.
 */
router.get(
  "/",
  [
    query("lat")
      .exists({
        checkNull: true,
      })
      .withMessage(
        "Latitude is required."
      )
      .bail()
      .isFloat({
        min: -90,
        max: 90,
      })
      .withMessage(
        "Latitude must be between -90 and 90."
      )
      .toFloat(),

    query("lon")
      .exists({
        checkNull: true,
      })
      .withMessage(
        "Longitude is required."
      )
      .bail()
      .isFloat({
        min: -180,
        max: 180,
      })
      .withMessage(
        "Longitude must be between -180 and 180."
      )
      .toFloat(),
  ],
  validate,
  getWeather
);

module.exports = router;