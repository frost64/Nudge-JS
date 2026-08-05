const mongoose = require("mongoose");

const USER_ROLES = [
  "user",
  "admin",
];

const USER_THEMES = [
  "light",
  "dark",
];

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalizes string-array values, removes empty entries,
 * and removes case-insensitive duplicates.
 *
 * @param {unknown} value
 * @returns {string[]}
 */
function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const uniqueValues = new Set();
  const normalizedValues = [];

  for (const item of value) {
    const normalizedItem = String(
      item ?? ""
    ).trim();

    if (!normalizedItem) {
      continue;
    }

    const comparisonValue =
      normalizedItem.toLowerCase();

    if (
      uniqueValues.has(
        comparisonValue
      )
    ) {
      continue;
    }

    uniqueValues.add(
      comparisonValue
    );

    normalizedValues.push(
      normalizedItem
    );
  }

  return normalizedValues;
}

/**
 * Removes authentication secrets before a user document
 * is serialized into an API response.
 *
 * @param {mongoose.Document} document
 * @param {object} returnedObject
 * @returns {object}
 */
function removeSensitiveFields(
  document,
  returnedObject
) {
  delete returnedObject.password;
  delete returnedObject.passwordResetToken;
  delete returnedObject.passwordResetExpires;

  return returnedObject;
}

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [
        true,
        "Full name is required.",
      ],
      trim: true,
      minlength: [
        1,
        "Full name is required.",
      ],
      maxlength: [
        120,
        "Full name cannot exceed 120 characters.",
      ],
    },

    username: {
      type: String,
      required: [
        true,
        "Username is required.",
      ],
      unique: true,
      trim: true,
      minlength: [
        3,
        "Username must be at least 3 characters.",
      ],
      maxlength: [
        50,
        "Username cannot exceed 50 characters.",
      ],
    },

    email: {
      type: String,
      required: [
        true,
        "Email is required.",
      ],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [
        254,
        "Email cannot exceed 254 characters.",
      ],
      match: [
        EMAIL_PATTERN,
        "Please enter a valid email address.",
      ],
    },

    /*
     * Passwords are hashed by the authentication controller
     * before being stored. Do not add another hashing hook here,
     * because that would hash existing bcrypt hashes twice.
     */
    password: {
      type: String,
      required: [
        true,
        "Password is required.",
      ],
      minlength: [
        6,
        "Password is invalid.",
      ],
      maxlength: [
        255,
        "Password is invalid.",
      ],
    },

    role: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: {
        values: USER_ROLES,
        message:
          "Role must be user or admin.",
      },
      default: "user",
    },

    avatar: {
      type: String,
      trim: true,
      maxlength: [
        2048,
        "Avatar value cannot exceed 2048 characters.",
      ],
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "Bio cannot exceed 1000 characters.",
      ],
      default: "",
    },

    theme: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: {
        values: USER_THEMES,
        message:
          "Theme must be light or dark.",
      },
      default: "light",
    },

    passwordResetToken: {
      type: String,
      trim: true,
      default: undefined,
    },

    passwordResetExpires: {
      type: Date,
      default: undefined,
    },

    favorites: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: [
            200,
            "Favorite value cannot exceed 200 characters.",
          ],
        },
      ],
      default: [],
      set: normalizeStringArray,
    },
  },
  {
    timestamps: true,
    versionKey: false,

    toJSON: {
      virtuals: true,
      transform:
        removeSensitiveFields,
    },
  }
);

/*
 * Supports administrator user lists filtered by role.
 */
userSchema.index({
  role: 1,
  createdAt: -1,
});

/*
 * Supports password-reset token lookups.
 */
userSchema.index(
  {
    passwordResetToken: 1,
    passwordResetExpires: 1,
  },
  {
    sparse: true,
  }
);

/*
 * Supports recently registered user queries.
 */
userSchema.index({
  createdAt: -1,
});

module.exports =
  mongoose.models.User ||
  mongoose.model(
    "User",
    userSchema
  );