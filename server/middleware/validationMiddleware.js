const {
  validationResult,
} = require("express-validator");

/**
 * Removes submitted values from validation errors so
 * sensitive fields such as passwords are not returned.
 *
 * @param {object} error
 * @returns {object}
 */
function formatValidationError(error) {
  return {
    type: error.type,
    message: error.msg,
    msg: error.msg,
    path: error.path,
    location: error.location,
  };
}

/**
 * Returns validation errors produced by express-validator
 * or continues to the next middleware.
 */
function validate(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result
    .array({
      onlyFirstError: true,
    })
    .map(formatValidationError);

  return res.status(400).json({
    success: false,
    message: "Validation failed.",
    errors,
  });
}

module.exports = validate;