require("dotenv").config();
const nodemailer = require("nodemailer");
const systemLogger = require("../utils/systemLogger");
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter
  .verify()
  .then(async () => {
    console.log("Mailer Ready");

    await systemLogger({
      level: "success",
      category: "mail",
      source: "Mail Service",
      message: "SMTP mail service connected successfully",
    });
  })
  .catch(async (error) => {
    console.error(error);

    await systemLogger({
      level: "error",
      category: "mail",
      source: "Mail Service",
      message: "SMTP mail service failed to connect",
      details: {
        error: error.message,
      },
    });
  });

module.exports = transporter;