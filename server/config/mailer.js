const { Resend } = require("resend");

const resend = new Resend(
  process.env.RESEND_API_KEY
);

const transporter = {
  async sendMail({
    to,
    subject,
    html,
    text,
  }) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error(
        "RESEND_API_KEY is not configured."
      );
    }

    const from =
      process.env.EMAIL_FROM ||
      "Nudge <onboarding@resend.dev>";

    const recipients =
      Array.isArray(to)
        ? to
        : [to];

    const { data, error } =
      await resend.emails.send({
        from,
        to: recipients,
        subject,
        html,
        ...(text ? { text } : {}),
      });

    if (error) {
      console.error(
        "Resend email error:",
        error
      );

      throw new Error(
        error.message ||
          "Failed to send email."
      );
    }

    return {
      messageId: data?.id,
      ...data,
    };
  },

  verify(callback) {
    const error =
      !process.env.RESEND_API_KEY
        ? new Error(
            "RESEND_API_KEY is not configured."
          )
        : null;

    if (
      typeof callback === "function"
    ) {
      callback(error, !error);
      return;
    }

    if (error) {
      return Promise.reject(error);
    }

    return Promise.resolve(true);
  },
};

module.exports = transporter;