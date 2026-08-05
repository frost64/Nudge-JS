require("dotenv").config();

const nodemailer = require("nodemailer");

const systemLogger = require("../utils/systemLogger");

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_SECURE =
  process.env.SMTP_SECURE === "true" ||
  SMTP_PORT === 465;

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASS;

/**
 * Shared SMTP transporter used throughout the application.
 */
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,

  auth: {
    user: emailUser,
    pass: emailPassword,
  },

  pool: true,
  maxConnections: 5,
  maxMessages: 100,

  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 30_000,
});

/**
 * Writes a system log without allowing logger failures
 * to interrupt mail-service initialization.
 *
 * @param {object} event
 * @returns {Promise<void>}
 */
async function safelyLogSystemEvent(event) {
  try {
    await systemLogger(event);
  } catch (loggingError) {
    console.error(
      "Failed to write mail-service system log:",
      loggingError
    );
  }
}

/**
 * Verifies the configured SMTP connection.
 *
 * Mail failure is logged but does not terminate the server,
 * allowing non-email application features to remain available.
 *
 * @returns {Promise<void>}
 */
async function verifyMailer() {
  if (!emailUser || !emailPassword) {
    const message =
      "EMAIL_USER or EMAIL_PASS is missing from the environment.";

    console.error(message);

    await safelyLogSystemEvent({
      level: "error",
      category: "mail",
      source: "Mail Service",
      message: "SMTP mail service is not configured",
      details: {
        error: message,
      },
    });

    return;
  }

  try {
    await transporter.verify();

    console.log("SMTP mail service connected successfully.");

    await safelyLogSystemEvent({
      level: "success",
      category: "mail",
      source: "Mail Service",
      message:
        "SMTP mail service connected successfully",
    });
  } catch (error) {
    console.error(
      "SMTP mail service failed to connect:",
      error
    );

    await safelyLogSystemEvent({
      level: "error",
      category: "mail",
      source: "Mail Service",
      message:
        "SMTP mail service failed to connect",
      details: {
        error: error.message,
        name: error.name,
        code: error.code,
      },
    });
  }
}

verifyMailer();

module.exports = transporter;