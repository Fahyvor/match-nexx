import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "";

const EMAIL_FROM =
  process.env.EMAIL_FROM || SMTP_USER;

const CONTACT_EMAIL =
  process.env.CONTACT_EMAIL || "elreytechnologies@gmail.com";

console.log("SMTP_HOST:", SMTP_HOST);
console.log("SMTP_PORT:", SMTP_PORT);
console.log("SMTP_USER:", SMTP_USER);
console.log("EMAIL_FROM:", EMAIL_FROM);
console.log("CONTACT_EMAIL:", CONTACT_EMAIL);

/**
 * SMTP transporter
 */
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,

  // 465 = SSL
  // 587 = STARTTLS
  secure: SMTP_PORT === 465,

  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

/**
 * Verify SMTP connection when the application starts.
 */
transporter.verify((error) => {
  if (error) {
    console.error("SMTP CONNECTION ERROR:", error);
  } else {
    console.log("SMTP SERVER READY");
  }
});

export const emailService = {
  /**
   * Send contact form submission to admin.
   */
  sendContactEmail: async ({
    name,
    email,
    subject,
    message,
  }: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    try {
      const info = await transporter.sendMail({
        from: EMAIL_FROM,

        // Where the contact message should arrive
        to: CONTACT_EMAIL,

        // Clicking Reply in your email client replies directly
        // to the person who submitted the form.
        replyTo: email,

        subject: `MatchNexx Contact ${subject}`,

        text: `
            New MatchNexx Contact Form Submission

            Name: ${name}
            Email: ${email}
            Subject: ${subject}

            Message:
            ${message}

        --------------------------------
        This message was submitted through the MatchNexx contact form.
        `.trim(),

        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <title>MatchNexx Contact</title>
            </head>

            <body
              style="
                margin: 0;
                padding: 0;
                background: #f5f5f5;
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #222;
              "
            >
              <div
                style="
                  max-width: 650px;
                  margin: 40px auto;
                  background: #ffffff;
                  padding: 30px;
                  border-radius: 10px;
                  border: 1px solid #eeeeee;
                "
              >

                <h2 style="margin-top: 0; margin-bottom: 24px;">
                  New Contact Form Submission
                </h2>

                <div style="margin-bottom: 20px;">
                  <strong>Name:</strong>
                  <p style="margin: 5px 0;">
                    ${escapeHtml(name)}
                  </p>
                </div>

                <div style="margin-bottom: 20px;">
                  <strong>Email:</strong>
                  <p style="margin: 5px 0;">
                    ${escapeHtml(email)}
                  </p>
                </div>

                <div style="margin-bottom: 20px;">
                  <strong>Subject:</strong>
                  <p style="margin: 5px 0;">
                    ${escapeHtml(subject)}
                  </p>
                </div>

                <div style="margin-bottom: 20px;">
                  <strong>Message:</strong>

                  <p
                    style="
                      margin: 5px 0;
                      white-space: pre-wrap;
                    "
                  >
                    ${escapeHtml(message)}
                  </p>
                </div>

                <hr
                  style="
                    margin: 30px 0;
                    border: none;
                    border-top: 1px solid #eeeeee;
                  "
                />

                <p
                  style="
                    margin: 0;
                    font-size: 12px;
                    color: #777;
                  "
                >
                  This message was submitted through the
                  MatchNexx contact form.
                </p>

              </div>
            </body>
          </html>
        `,
      });

      console.log(
        "CONTACT EMAIL SENT:",
        info.messageId
      );

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error(
        "SMTP CONTACT EMAIL ERROR:",
        error
      );

      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to send contact email"
      );
    }
  },

  /**
   * Send password reset email.
   */
  sendPasswordResetEmail: async ({
    email,
    firstName,
    resetUrl,
  }: {
    email: string;
    firstName?: string;
    resetUrl: string;
  }) => {
    try {
      const info = await transporter.sendMail({
        from: EMAIL_FROM,

        to: email,

        subject: "Reset your MatchNexx password",

        text: `
Hi ${firstName || "there"},

We received a request to reset your MatchNexx password.

Reset your password here:

${resetUrl}

This link will expire in 30 minutes.

If you did not request this password reset, you can safely ignore this email.

MatchNexx
        `.trim(),

        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <title>Reset your MatchNexx password</title>
            </head>

            <body
              style="
                margin: 0;
                padding: 0;
                background: #f5f5f5;
                font-family: Arial, sans-serif;
              "
            >

              <div
                style="
                  max-width: 600px;
                  margin: 40px auto;
                  background: #ffffff;
                  padding: 40px;
                  border-radius: 10px;
                  border: 1px solid #eeeeee;
                "
              >

                <h1
                  style="
                    margin-top: 0;
                    margin-bottom: 20px;
                  "
                >
                  Reset Your Password
                </h1>

                <p>
                  Hi ${escapeHtml(firstName || "there")},
                </p>

                <p>
                  We received a request to reset your
                  MatchNexx password.
                </p>

                <p>
                  Click the button below to create a new password.
                </p>

                <div style="margin: 30px 0;">

                  <a
                    href="${escapeHtml(resetUrl)}"
                    style="
                      display: inline-block;
                      padding: 14px 24px;
                      background: #06b6d4;
                      color: #ffffff;
                      text-decoration: none;
                      border-radius: 6px;
                      font-weight: bold;
                    "
                  >
                    Reset Password
                  </a>

                </div>

                <p>
                  This link will expire in
                  <strong>30 minutes</strong>.
                </p>

                <p>
                  If you did not request a password reset,
                  you can safely ignore this email.
                </p>

                <hr
                  style="
                    margin: 30px 0;
                    border: none;
                    border-top: 1px solid #eeeeee;
                  "
                />

                <p
                  style="
                    margin: 0;
                    font-size: 12px;
                    color: #777;
                  "
                >
                  MatchNexx
                </p>

              </div>

            </body>
          </html>
        `,
      });

      console.log(
        "PASSWORD RESET EMAIL SENT:",
        info.messageId
      );

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error(
        "SMTP PASSWORD RESET EMAIL ERROR:",
        error
      );

      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to send password reset email"
      );
    }
  },
};

/**
 * Escape user-controlled content before
 * putting it into HTML.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}