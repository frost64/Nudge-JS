const mongoose = require("mongoose");

const Link = require("../models/Link");
const User = require("../models/User");

const logActivity = require("../utils/activityLogger");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const ALLOWED_URL_PROTOCOLS = new Set([
  "http:",
  "https:",
]);

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

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? fallbackMessage
        : error.message || fallbackMessage,
  });
}

/**
 * Converts a query value into a bounded positive integer.
 *
 * @param {unknown} value
 * @param {number} fallback
 * @param {number} maximum
 * @returns {number}
 */
function parsePositiveInteger(
  value,
  fallback,
  maximum = Number.MAX_SAFE_INTEGER
) {
  const parsedValue = Number.parseInt(
    value,
    10
  );

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 1
  ) {
    return fallback;
  }

  return Math.min(
    parsedValue,
    maximum
  );
}

/**
 * Checks whether a URL is valid and uses an allowed protocol.
 *
 * @param {string} value
 * @returns {boolean}
 */
function isValidUrl(value) {
  try {
    const parsedUrl = new URL(value);

    return ALLOWED_URL_PROTOCOLS.has(
      parsedUrl.protocol
    );
  } catch {
    return false;
  }
}

/**
 * Validates and normalizes link request data.
 *
 * @param {object} body
 * @returns {{
 *   error: string|null,
 *   data: object|null
 * }}
 */
function validateLinkPayload(body) {
  const title = String(
    body.title ?? ""
  ).trim();

  const url = String(
    body.url ?? ""
  ).trim();

  const category = String(
    body.category ?? ""
  ).trim();

  const notes = String(
    body.notes ?? ""
  ).trim();

  if (!title) {
    return {
      error: "Title is required.",
      data: null,
    };
  }

  if (!url) {
    return {
      error: "URL is required.",
      data: null,
    };
  }

  if (!isValidUrl(url)) {
    return {
      error:
        "Please enter a valid HTTP or HTTPS URL.",
      data: null,
    };
  }

  if (!category) {
    return {
      error: "Category is required.",
      data: null,
    };
  }

  if (!notes) {
    return {
      error:
        "Description is required.",
      data: null,
    };
  }

  return {
    error: null,
    data: {
      title,
      url,
      category,
      notes,
    },
  };
}

/**
 * Records link activity without allowing activity-log
 * failures to break the main request.
 *
 * @param {string} userId
 * @param {string} type
 * @param {string} action
 * @returns {Promise<void>}
 */
async function safelyLogLinkActivity(
  userId,
  type,
  action
) {
  try {
    const user = await User.findById(
      userId
    )
      .select("username")
      .lean();

    if (!user) {
      return;
    }

    await logActivity({
      type,
      message:
        `${user.username} ${action} a link`,
      user: user._id,
    });
  } catch (error) {
    console.error(
      "Failed to write link activity:",
      error
    );
  }
}

/**
 * Creates a link belonging to the authenticated user.
 */
async function createLink(req, res) {
  try {
    const { error, data } =
      validateLinkPayload(
        req.body
      );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const link = await Link.create({
      ...data,
      user: req.user.id,
    });

    await safelyLogLinkActivity(
      req.user.id,
      "link_created",
      "created"
    );

    return res.status(201).json(
      link
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to create link."
    );
  }
}

/**
 * Returns the authenticated user's links with pagination.
 */
async function getLinks(req, res) {
  try {
    const page =
      parsePositiveInteger(
        req.query.page,
        DEFAULT_PAGE
      );

    const limit =
      parsePositiveInteger(
        req.query.limit,
        DEFAULT_LIMIT,
        MAX_LIMIT
      );

    const skip =
      (page - 1) * limit;

    const filter = {
      user: req.user.id,
    };

    const [links, total] =
      await Promise.all([
        Link.find(filter)
          .sort({
            createdAt: -1,
            _id: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Link.countDocuments(
          filter
        ),
      ]);

    return res.status(200).json({
      page,
      limit,
      total,
      pages:
        total === 0
          ? 0
          : Math.ceil(total / limit),
      data: links,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to load links."
    );
  }
}

/**
 * Updates one link owned by the authenticated user.
 */
async function updateLink(req, res) {
  try {
    const { id } = req.params;

    if (
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID.",
      });
    }

    const { error, data } =
      validateLinkPayload(
        req.body
      );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const link =
      await Link.findOneAndUpdate(
        {
          _id: id,
          user: req.user.id,
        },
        {
          $set: data,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found.",
      });
    }

    await safelyLogLinkActivity(
      req.user.id,
      "link_updated",
      "updated"
    );

    return res.status(200).json(
      link
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to update link."
    );
  }
}

/**
 * Deletes one link owned by the authenticated user.
 */
async function deleteLink(req, res) {
  try {
    const { id } = req.params;

    if (
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID.",
      });
    }

    const link =
      await Link.findOneAndDelete({
        _id: id,
        user: req.user.id,
      });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found.",
      });
    }

    await safelyLogLinkActivity(
      req.user.id,
      "link_deleted",
      "deleted"
    );

    return res.status(200).json({
      success: true,
      message:
        "Link deleted successfully.",
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to delete link."
    );
  }
}

/**
 * Toggles the favorite status of one user-owned link.
 */
async function toggleFavoriteLink(
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
        message: "Invalid link ID.",
      });
    }

    const link = await Link.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found.",
      });
    }

    link.favorite =
      !Boolean(link.favorite);

    await link.save();

    return res.status(200).json(
      link
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to update favorite status."
    );
  }
}

module.exports = {
  createLink,
  deleteLink,
  getLinks,
  toggleFavoriteLink,
  updateLink,
};