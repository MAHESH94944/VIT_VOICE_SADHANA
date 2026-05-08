const nodemailer = require("nodemailer");
const axios = require("axios");

// Helper to build transport options (same logic as authController)
function buildTransportOptions() {
  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: (process.env.EMAIL_PASS || "").replace(/\s+/g, ""),
    },
  };
}

exports.testEmail = async (req, res) => {
  const secret = req.query.secret || req.headers["x-debug-secret"];
  if (!process.env.DEBUG_SECRET || secret !== process.env.DEBUG_SECRET) {
    return res.status(403).json({ message: "Forbidden: invalid debug secret" });
  }

  const transportOptions = buildTransportOptions();
  const transporter = nodemailer.createTransport(transportOptions);

  const result = { verified: false, verifyError: null, sendResult: null };

  try {
    await transporter.verify();
    result.verified = true;
  } catch (err) {
    result.verifyError = err && err.message ? err.message : String(err);
  }

  // Optionally send a small test email if ?send=true
  if (req.query.send === "true") {
    const to = req.query.to || process.env.EMAIL_USER;
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: "SMTP test from VIT VOICE Sadhana",
      text: `This is a test email from your deployed backend at ${new Date().toISOString()}`,
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      result.sendResult = info;
    } catch (err) {
      result.sendResult = {
        error: err && err.message ? err.message : String(err),
      };

      // Attempt SendGrid fallback if configured
      if (process.env.SENDGRID_API_KEY) {
        try {
          const sgMail = require("@sendgrid/mail");
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          const sgRes = await sgMail.send({
            to,
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            subject: mailOptions.subject,
            text: mailOptions.text,
          });
          result.sendResult = { sendgrid: sgRes };
        } catch (sgErr) {
          result.sendResult.sendgridError =
            sgErr && sgErr.message ? sgErr.message : String(sgErr);
        }
      }

      // Attempt Brevo fallback if configured
      if (process.env.BREVO_API_KEY) {
        try {
          const rawFrom =
            process.env.EMAIL_FROM ||
            process.env.EMAIL_USER ||
            "no-reply@example.com";
          let sender = {
            name: "VIT VOICE Sadhana",
            email: process.env.EMAIL_USER,
          };
          const m = String(rawFrom).match(/(.*)<(.+)>/);
          if (m) {
            sender.name = m[1].trim().replace(/^"|"$/g, "");
            sender.email = m[2].trim();
          } else if (rawFrom && rawFrom.includes("@")) {
            sender.email = String(rawFrom).trim();
          }

          const payload = {
            sender,
            to: [{ email: to }],
            subject: mailOptions.subject,
            htmlContent: mailOptions.text,
            textContent: mailOptions.text,
          };

          const brevoRes = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            payload,
            {
              headers: {
                "api-key": process.env.BREVO_API_KEY,
                "Content-Type": "application/json",
              },
              timeout: 10000,
            },
          );
          result.sendResult = { brevo: brevoRes.data || brevoRes.status };
        } catch (brevoErr) {
          result.sendResult = {
            ...(result.sendResult || {}),
            brevoError:
              brevoErr && brevoErr.message
                ? brevoErr.message
                : String(brevoErr),
          };
        }
      }
    }
  }

  res.json(result);
};
