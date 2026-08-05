const mongoose = require("mongoose");

const Note = require("../models/Note");
const User = require("../models/User");

const logActivity = require("../utils/activityLogger");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

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
 * Normalizes tags, removes empty values, and removes
 * case-insensitive duplicates while preserving order.
 *
 * @param {unknown} value
 * @returns {string[]}
 */
function normalizeTags(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenTags = new Set();
  const normalizedTags = [];

  for (const tag of value) {
    const normalizedTag = String(
      tag ?? ""
    ).trim();

    if (!normalizedTag) {
      continue;
    }

    const comparisonValue =
      normalizedTag.toLowerCase();

    if (seenTags.has(comparisonValue)) {
      continue;
    }

    seenTags.add(comparisonValue);
    normalizedTags.push(normalizedTag);
  }

  return normalizedTags;
}

/**
 * Validates and normalizes note request data.
 *
 * @param {object} body
 * @returns {{
 *   error: string|null,
 *   data: object|null
 * }}
 */
function validateNotePayload(body = {}) {
  const title = String(
    body.title ?? ""
  ).trim();

  const content = String(
    body.content ?? ""
  ).trim();

  const tags = normalizeTags(
    body.tags
  );

  if (!title) {
    return {
      error: "Title is required.",
      data: null,
    };
  }

  if (!content) {
    return {
      error:
        "Description is required.",
      data: null,
    };
  }

  if (tags.length === 0) {
    return {
      error:
        "Please add at least one tag.",
      data: null,
    };
  }

  return {
    error: null,
    data: {
      title,
      content,
      tags,
    },
  };
}

/**
 * Records note activity without allowing logging
 * failures to break the main request.
 *
 * @param {string} userId
 * @param {string} type
 * @param {string} action
 * @returns {Promise<void>}
 */
async function safelyLogNoteActivity(
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
        `${user.username} ${action} a note`,
      user: user._id,
    });
  } catch (error) {
    console.error(
      "Failed to write note activity:",
      error
    );
  }
}

/**
 * Creates a note belonging to the authenticated user.
 */
async function createNote(req, res) {
  try {
    const { error, data } =
      validateNotePayload(
        req.body
      );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const note = await Note.create({
      ...data,
      user: req.user.id,
    });

    await safelyLogNoteActivity(
      req.user.id,
      "note_created",
      "created"
    );

    return res.status(201).json(
      note
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to create note."
    );
  }
}

/**
 * Returns the authenticated user's notes with pagination.
 */
async function getNotes(req, res) {
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

    const [notes, total] =
      await Promise.all([
        Note.find(filter)
          .sort({
            pinned: -1,
            createdAt: -1,
            _id: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Note.countDocuments(
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
      data: notes,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to load notes."
    );
  }
}

/**
 * Updates one note owned by the authenticated user.
 */
async function updateNote(req, res) {
  try {
    const { id } = req.params;

    if (
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    const { error, data } =
      validateNotePayload(
        req.body
      );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const note =
      await Note.findOneAndUpdate(
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

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    await safelyLogNoteActivity(
      req.user.id,
      "note_updated",
      "updated"
    );

    return res.status(200).json(
      note
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to update note."
    );
  }
}

/**
 * Deletes one note owned by the authenticated user.
 */
async function deleteNote(req, res) {
  try {
    const { id } = req.params;

    if (
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    const note =
      await Note.findOneAndDelete({
        _id: id,
        user: req.user.id,
      });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    await safelyLogNoteActivity(
      req.user.id,
      "note_deleted",
      "deleted"
    );

    return res.status(200).json({
      success: true,
      message:
        "Note deleted successfully.",
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to delete note."
    );
  }
}

/**
 * Toggles the pinned status of one user-owned note.
 */
async function togglePinNote(req, res) {
  try {
    const { id } = req.params;

    if (
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    const note = await Note.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    note.pinned =
      !Boolean(note.pinned);

    await note.save();

    return res.status(200).json(
      note
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to update pinned status."
    );
  }
}

/**
 * Toggles the favorite status of one user-owned note.
 */
async function toggleFavoriteNote(
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
        message: "Invalid note ID.",
      });
    }

    const note = await Note.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    note.favorite =
      !Boolean(note.favorite);

    await note.save();

    return res.status(200).json(
      note
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
  createNote,
  deleteNote,
  getNotes,
  toggleFavoriteNote,
  togglePinNote,
  updateNote,
};