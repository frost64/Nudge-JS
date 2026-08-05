const path = require("path");

const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const connectDB = require("./config/db");

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const birthdayRoutes = require("./routes/birthdayRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const linkRoutes = require("./routes/linkRoutes");
const noteRoutes = require("./routes/noteRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const searchRoutes = require("./routes/searchRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const userRoutes = require("./routes/userRoutes");
const weatherRoutes = require("./routes/weatherRoutes");

const authMiddleware = require(
  "./middleware/authMiddleware"
);
const errorHandler = require(
  "./middleware/errorMiddleware"
);
const limiter = require(
  "./middleware/rateLimiter"
);
const notFound = require(
  "./middleware/notFound"
);

const systemLogger = require(
  "./utils/systemLogger"
);

const app = express();

const DEFAULT_PORT = 5000;
const DEFAULT_HOST = "0.0.0.0";
const DEFAULT_BODY_LIMIT = "1mb";
const SHUTDOWN_TIMEOUT_MS = 10_000;

const UPLOADS_DIRECTORY = path.resolve(
  __dirname,
  "uploads"
);

/**
 * Parses a positive integer environment value.
 *
 * @param {unknown} value
 * @param {number} fallback
 * @returns {number}
 */
function parsePositiveInteger(
  value,
  fallback
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

  return parsedValue;
}

/**
 * Removes trailing slashes from an origin.
 *
 * @param {unknown} value
 * @returns {string}
 */
function normalizeOrigin(value) {
  return String(value ?? "")
    .trim()
    .replace(/\/+$/, "");
}

/**
 * Returns configured frontend origins.
 *
 * CORS_ORIGINS may contain multiple comma-separated
 * origins. FRONTEND_URL remains supported as a fallback.
 *
 * @returns {string[]}
 */
function getAllowedOrigins() {
  const configuredOrigins =
    process.env.CORS_ORIGINS ||
    process.env.FRONTEND_URL ||
    "";

  return configuredOrigins
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);
}

/**
 * Parses the Express trust-proxy configuration.
 *
 * @returns {boolean|number|string}
 */
function getTrustProxySetting() {
  const configuredValue =
    process.env.TRUST_PROXY;

  if (
    configuredValue === undefined ||
    configuredValue === ""
  ) {
    return process.env.NODE_ENV ===
      "production"
      ? 1
      : false;
  }

  const normalizedValue = String(
    configuredValue
  )
    .trim()
    .toLowerCase();

  if (normalizedValue === "true") {
    return true;
  }

  if (normalizedValue === "false") {
    return false;
  }

  const numericValue = Number.parseInt(
    normalizedValue,
    10
  );

  if (
    Number.isInteger(numericValue) &&
    numericValue >= 0
  ) {
    return numericValue;
  }

  return configuredValue;
}

/**
 * Writes system logs without allowing logging failures
 * to interrupt startup or shutdown.
 *
 * @param {object} log
 * @returns {Promise<void>}
 */
async function safelyWriteSystemLog(log) {
  try {
    await systemLogger(log);
  } catch (error) {
    console.error(
      "Failed to write system log:",
      error
    );
  }
}

const port = parsePositiveInteger(
  process.env.PORT,
  DEFAULT_PORT
);

const host =
  process.env.HOST?.trim() ||
  DEFAULT_HOST;

const bodyLimit =
  process.env.BODY_LIMIT?.trim() ||
  DEFAULT_BODY_LIMIT;

const allowedOrigins =
  getAllowedOrigins();

const corsOptions = {
  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Authorization",
    "Content-Type",
    "Accept",
  ],

  optionsSuccessStatus: 204,

  origin(origin, callback) {
    /*
     * Requests without an Origin header include server-to-server
     * requests, health checks, Postman, and mobile applications.
     */
    if (!origin) {
      return callback(null, true);
    }

    /*
     * Preserve permissive development behavior when no frontend
     * origins have been configured.
     */
    if (allowedOrigins.length === 0) {
      return callback(null, true);
    }

    const normalizedOrigin =
      normalizeOrigin(origin);

    if (
      allowedOrigins.includes(
        normalizedOrigin
      )
    ) {
      return callback(null, true);
    }

    const error = new Error(
      "Origin is not allowed by CORS."
    );

    error.statusCode = 403;

    return callback(error);
  },
};

app.disable("x-powered-by");

app.set(
  "trust proxy",
  getTrustProxySetting()
);

/*
 * Basic response-security headers.
 */
app.use((req, res, next) => {
  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );

  res.setHeader(
    "X-Frame-Options",
    "DENY"
  );

  res.setHeader(
    "Referrer-Policy",
    "no-referrer"
  );

  next();
});

/*
 * CORS must run before routes and static files so frontend
 * applications can request both API data and uploaded avatars.
 */
app.use(cors(corsOptions));

/*
 * Uploaded avatars are publicly accessible.
 */
app.use(
  "/uploads",
  express.static(
    UPLOADS_DIRECTORY,
    {
      dotfiles: "deny",
      index: false,
      fallthrough: true,
      etag: true,
      maxAge: "7d",

      setHeaders(res) {
        res.setHeader(
          "X-Content-Type-Options",
          "nosniff"
        );
      },
    }
  )
);

/*
 * Request-body parsers.
 */
app.use(
  express.json({
    limit: bodyLimit,
  })
);

app.use(
  express.urlencoded({
    extended: false,
    limit: bodyLimit,
  })
);

/*
 * Apply rate limiting only to API requests.
 * Static avatar requests and the root status route do not
 * consume the API request allowance.
 */
app.use("/api", limiter);

/*
 * Public API status routes.
 */
app.get("/", (req, res) => {
  return res
    .status(200)
    .type("text/plain")
    .send("Nudge API Running");
});

app.get("/api/health", (req, res) => {
  const databaseConnected =
    mongoose.connection.readyState === 1;

  return res
    .status(
      databaseConnected ? 200 : 503
    )
    .json({
      success: databaseConnected,

      status: databaseConnected
        ? "healthy"
        : "degraded",

      database: databaseConnected
        ? "connected"
        : "disconnected",

      environment:
        process.env.NODE_ENV ||
        "development",

      uptime: Math.floor(
        process.uptime()
      ),

      timestamp:
        new Date().toISOString(),
    });
});

/*
 * Application routes.
 */
app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/reminders",
  reminderRoutes
);

app.use(
  "/api/birthdays",
  birthdayRoutes
);

app.use(
  "/api/notes",
  noteRoutes
);

app.use(
  "/api/links",
  linkRoutes
);

app.use(
  "/api/weather",
  weatherRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/search",
  searchRoutes
);

app.use(
  "/api/calendar",
  calendarRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/suggestions",
  suggestionRoutes
);

/*
 * Protected diagnostic route retained from the existing API.
 */
app.get(
  "/api/protected",
  authMiddleware,
  (req, res) => {
    return res.status(200).json({
      success: true,
      message:
        "Protected Route Access Granted",
      user: req.user,
    });
  }
);

/*
 * These middleware functions must remain last.
 */
app.use(notFound);
app.use(errorHandler);

let server = null;
let isShuttingDown = false;

/**
 * Closes the HTTP server while allowing active requests
 * a limited amount of time to finish.
 *
 * @returns {Promise<void>}
 */
async function closeHttpServer() {
  if (!server) {
    return;
  }

  await new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;
      resolve();
    };

    const timeout = setTimeout(() => {
      if (
        typeof server.closeAllConnections ===
        "function"
      ) {
        server.closeAllConnections();
      }

      finish();
    }, SHUTDOWN_TIMEOUT_MS);

    timeout.unref();

    server.close(() => {
      clearTimeout(timeout);
      finish();
    });
  });
}

/**
 * Gracefully stops the HTTP server and MongoDB connection.
 *
 * @param {string} signal
 * @param {number} exitCode
 * @param {unknown} [error]
 * @returns {Promise<void>}
 */
async function shutdown(
  signal,
  exitCode = 0,
  error = null
) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(
    `${signal} received. Shutting down Nudge API...`
  );

  if (error) {
    console.error(error);
  }

  await safelyWriteSystemLog({
    level:
      exitCode === 0
        ? "info"
        : "error",

    category: "system",
    source: "Server",

    message:
      exitCode === 0
        ? `Server shutdown initiated by ${signal}`
        : `Server shutting down because of ${signal}`,

    details: {
      signal,
      exitCode,

      error:
        error instanceof Error
          ? {
              name: error.name,
              message:
                error.message,
            }
          : error,
    },
  });

  try {
    await closeHttpServer();

    if (
      mongoose.connection.readyState !==
      0
    ) {
      await mongoose.connection.close(
        false
      );
    }
  } catch (shutdownError) {
    console.error(
      "Graceful shutdown failed:",
      shutdownError
    );

    exitCode = 1;
  }

  process.exit(exitCode);
}

/**
 * Connects to MongoDB and starts the Express server.
 *
 * @returns {Promise<import("http").Server>}
 */
async function startServer() {
  try {
    await connectDB();

    server = await new Promise(
      (resolve, reject) => {
        const httpServer = app.listen(
          port,
          host,
          () => {
            httpServer.removeListener(
              "error",
              reject
            );

            resolve(httpServer);
          }
        );

        httpServer.once(
          "error",
          reject
        );
      }
    );

    console.log(
      `Nudge API running on ${host}:${port}`
    );

    await safelyWriteSystemLog({
      level: "success",
      category: "startup",
      source: "Server",
      message:
        `Express server started on port ${port}`,

      details: {
        host,
        port,

        environment:
          process.env.NODE_ENV ||
          "development",

        allowedOrigins:
          allowedOrigins.length > 0
            ? allowedOrigins
            : ["all"],
      },
    });

    return server;
  } catch (error) {
    console.error(
      "Failed to start Nudge API:",
      error
    );

    await safelyWriteSystemLog({
      level: "error",
      category: "startup",
      source: "Server",
      message:
        "Express server failed to start",

      details: {
        error,
      },
    });

    throw error;
  }
}

/*
 * Start the server only when this file is executed directly.
 * This allows the Express app to be imported by tests.
 */
if (require.main === module) {
  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.once(
    "uncaughtException",
    (error) => {
      void shutdown(
        "uncaughtException",
        1,
        error
      );
    }
  );

  process.once(
    "unhandledRejection",
    (reason) => {
      const error =
        reason instanceof Error
          ? reason
          : new Error(
              String(reason)
            );

      void shutdown(
        "unhandledRejection",
        1,
        error
      );
    }
  );

  startServer().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

/*
 * Export the app directly for compatibility with common
 * Express testing tools while exposing startup separately.
 */
module.exports = app;
module.exports.startServer =
  startServer;