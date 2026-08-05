const Birthday = require("../models/Birthday");
const Link = require("../models/Link");
const Note = require("../models/Note");
const Reminder = require("../models/Reminder");

const GLOBAL_SEARCH_LIMIT = 50;
const SUGGESTION_LIMIT_PER_TYPE = 3;
const MAX_SUGGESTIONS = 8;
const MIN_SUGGESTION_QUERY_LENGTH = 2;
const MAX_SEARCH_QUERY_LENGTH = 100;

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
 * Escapes characters that have special meaning
 * inside a regular expression.
 *
 * @param {string} value
 * @returns {string}
 */
function escapeRegularExpression(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

/**
 * Normalizes a search query.
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeSearchQuery(value) {
  return String(value ?? "").trim();
}

/**
 * Creates a safe case-insensitive search expression.
 *
 * @param {string} query
 * @returns {RegExp}
 */
function createSearchExpression(query) {
  return new RegExp(
    escapeRegularExpression(query),
    "i"
  );
}

/**
 * Validates a global-search query.
 *
 * @param {string} query
 * @returns {string|null}
 */
function validateSearchQuery(query) {
  if (!query) {
    return "Search query is required.";
  }

  if (
    query.length >
    MAX_SEARCH_QUERY_LENGTH
  ) {
    return `Search query cannot exceed ${MAX_SEARCH_QUERY_LENGTH} characters.`;
  }

  return null;
}

/**
 * Searches all supported resources belonging to
 * the authenticated user.
 */
async function globalSearch(req, res) {
  try {
    const query = normalizeSearchQuery(
      req.query.q
    );

    const validationError =
      validateSearchQuery(query);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const userId = req.user.id;
    const searchExpression =
      createSearchExpression(query);

    const [
      reminders,
      birthdays,
      notes,
      links,
    ] = await Promise.all([
      Reminder.find({
        user: userId,

        $or: [
          {
            title: searchExpression,
          },
          {
            description:
              searchExpression,
          },
          {
            category:
              searchExpression,
          },
        ],
      })
        .sort({
          updatedAt: -1,
          createdAt: -1,
        })
        .limit(GLOBAL_SEARCH_LIMIT)
        .select("-__v")
        .lean(),

      Birthday.find({
        user: userId,

        $or: [
          {
            name: searchExpression,
          },
          {
            relationship:
              searchExpression,
          },
          {
            notes: searchExpression,
          },
        ],
      })
        .sort({
          updatedAt: -1,
          createdAt: -1,
        })
        .limit(GLOBAL_SEARCH_LIMIT)
        .select("-__v")
        .lean(),

      Note.find({
        user: userId,

        $or: [
          {
            title: searchExpression,
          },
          {
            content: searchExpression,
          },
          {
            tags: searchExpression,
          },
        ],
      })
        .sort({
          pinned: -1,
          updatedAt: -1,
          createdAt: -1,
        })
        .limit(GLOBAL_SEARCH_LIMIT)
        .select("-__v")
        .lean(),

      Link.find({
        user: userId,

        $or: [
          {
            title: searchExpression,
          },
          {
            url: searchExpression,
          },
          {
            category:
              searchExpression,
          },
          {
            notes: searchExpression,
          },
        ],
      })
        .sort({
          updatedAt: -1,
          createdAt: -1,
        })
        .limit(GLOBAL_SEARCH_LIMIT)
        .select("-__v")
        .lean(),
    ]);

    return res.status(200).json({
      reminders,
      birthdays,
      notes,
      links,
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to perform search."
    );
  }
}

/**
 * Returns lightweight autocomplete suggestions
 * for the authenticated user.
 */
async function getSuggestions(req, res) {
  try {
    const query = normalizeSearchQuery(
      req.query.q
    );

    if (
      query.length <
      MIN_SUGGESTION_QUERY_LENGTH
    ) {
      return res.status(200).json([]);
    }

    if (
      query.length >
      MAX_SEARCH_QUERY_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: `Search query cannot exceed ${MAX_SEARCH_QUERY_LENGTH} characters.`,
      });
    }

    const userId = req.user.id;
    const searchExpression =
      createSearchExpression(query);

    const [
      reminders,
      notes,
      birthdays,
      links,
    ] = await Promise.all([
      Reminder.find({
        user: userId,
        title: searchExpression,
      })
        .sort({
          updatedAt: -1,
          createdAt: -1,
        })
        .limit(
          SUGGESTION_LIMIT_PER_TYPE
        )
        .select("_id title")
        .lean(),

      Note.find({
        user: userId,
        title: searchExpression,
      })
        .sort({
          pinned: -1,
          updatedAt: -1,
          createdAt: -1,
        })
        .limit(
          SUGGESTION_LIMIT_PER_TYPE
        )
        .select("_id title")
        .lean(),

      Birthday.find({
        user: userId,
        name: searchExpression,
      })
        .sort({
          updatedAt: -1,
          createdAt: -1,
        })
        .limit(
          SUGGESTION_LIMIT_PER_TYPE
        )
        .select("_id name")
        .lean(),

      Link.find({
        user: userId,
        title: searchExpression,
      })
        .sort({
          updatedAt: -1,
          createdAt: -1,
        })
        .limit(
          SUGGESTION_LIMIT_PER_TYPE
        )
        .select("_id title")
        .lean(),
    ]);

    const suggestions = [
      ...reminders.map((item) => ({
        type: "reminder",
        id: item._id,
        label: item.title,
      })),

      ...notes.map((item) => ({
        type: "note",
        id: item._id,
        label: item.title,
      })),

      ...birthdays.map((item) => ({
        type: "birthday",
        id: item._id,
        label: item.name,
      })),

      ...links.map((item) => ({
        type: "link",
        id: item._id,
        label: item.title,
      })),
    ].slice(0, MAX_SUGGESTIONS);

    return res.status(200).json(
      suggestions
    );
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to load search suggestions."
    );
  }
}

module.exports = {
  getSuggestions,
  globalSearch,
};