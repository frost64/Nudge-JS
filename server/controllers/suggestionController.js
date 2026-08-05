const mongoose = require("mongoose");

const Suggestion = require("../models/Suggestion");
const User = require("../models/User");

const logActivity = require("../utils/activityLogger");

/**
 * Sends a consistent server-error response.
 *
 * @param {import("express").Response} res
 * @param {Error} error
 * @param {string} fallbackMessage
 * @returns {import("express").Response}
 */
function sendServerError(
  res,
  error,
  fallbackMessage = "Internal server error."
) {
  console.error(error);

  if (error?.name === "ValidationError") {
    const validationMessage = Object.values(
      error.errors
    )
      .map((item) => item.message)
      .join(" ");

    return res.status(400).json({
      success: false,
      message:
        validationMessage ||
        "Suggestion validation failed.",
    });
  }

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? fallbackMessage
        : error.message || fallbackMessage,
  });
}

/**
 * Returns the authenticated user's ID.
 *
 * Supports middleware that stores the ID as either
 * req.user.id or req.user._id.
 *
 * @param {import("express").Request} req
 * @returns {string|null}
 */
function getAuthenticatedUserId(req) {
  return (
    req.user?.id ||
    req.user?._id?.toString() ||
    null
  );
}

/**
 * Validates and normalizes suggestion input.
 *
 * @param {object} body
 * @returns {{
 *   error: string|null,
 *   data: object|null
 * }}
 */
function validateSuggestionPayload(
  body = {}
) {
  const title = String(
    body.title ?? ""
  ).trim();

  const message = String(
    body.message ?? ""
  ).trim();

  if (!title || !message) {
    return {
      error:
        "Please fill all fields.",
      data: null,
    };
  }

  return {
    error: null,
    data: {
      title,
      message,
    },
  };
}

/**
 * Records suggestion activity without allowing an
 * activity-log failure to break the main request.
 *
 * @param {object} user
 * @returns {Promise<void>}
 */
async function safelyLogSuggestionActivity(
  user
) {
  try {
    await logActivity({
      type: "suggestion_created",
      message:
        `${user.username} submitted a suggestion`,
      user: user._id,
    });
  } catch (error) {
    console.error(
      "Failed to write suggestion activity:",
      error
    );
  }
}

/**
 * Creates a suggestion for the authenticated user.
 */
async function createSuggestion(req, res) {
  try {
    const userId =
      getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const { error, data } =
      validateSuggestionPayload(
        req.body
      );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const user = await User.findById(
      userId
    )
      .select(
        "fullName username"
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const suggestion =
      await Suggestion.create({
        user: user._id,
        fullName: user.fullName,
        username: user.username,
        title: data.title,
        message: data.message,
      });

    await safelyLogSuggestionActivity(
      user
    );

    return res.status(201).json(
      suggestion
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to create suggestion."
    );
  }
}

/**
 * Returns suggestions submitted by the authenticated user.
 */
async function getMySuggestions(req, res) {
  try {
    const userId =
      getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const suggestions =
      await Suggestion.find({
        user: userId,
      })
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .select("-__v")
        .lean();

    return res.status(200).json(
      suggestions
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to fetch suggestions."
    );
  }
}

/**
 * Returns all suggestions for an authenticated admin.
 *
 * The admin authorization check should remain in
 * the route middleware.
 */
async function getAllSuggestions(req, res) {
  try {
    const suggestions =
      await Suggestion.find()
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .select("-__v")
        .lean();

    return res.status(200).json(
      suggestions
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to fetch suggestions."
    );
  }
}

/**
 * Marks one suggestion as read.
 *
 * The admin authorization check should remain in
 * the route middleware.
 */
async function markSuggestionRead(
  req,
  res
) {
  try {
    const { id } = req.params;

    if (
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid suggestion ID.",
      });
    }

    const suggestion =
      await Suggestion.findByIdAndUpdate(
        id,
        {
          $set: {
            status: "read",
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message:
          "Suggestion not found.",
      });
    }

    return res.status(200).json(
      suggestion
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to update suggestion."
    );
  }
}

/**
 * Deletes one suggestion.
 *
 * The admin authorization check should remain in
 * the route middleware.
 */
async function deleteSuggestion(req, res) {
  try {
    const { id } = req.params;

    if (
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid suggestion ID.",
      });
    }

    const suggestion =
      await Suggestion.findByIdAndDelete(
        id
      );

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message:
          "Suggestion not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Suggestion deleted successfully.",
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to delete suggestion."
    );
  }
}

module.exports = {
  createSuggestion,
  deleteSuggestion,
  getAllSuggestions,
  getMySuggestions,
  markSuggestionRead,
};