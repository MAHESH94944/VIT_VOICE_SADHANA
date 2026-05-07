const nodemailer = require("nodemailer");

// Helper to build transport options (same logic as authController)
function buildTransportOptions() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpSecure =
    process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1";

  return smtpHost
    ? {
        host: smtpHost,
        port: smtpPort ? Number(smtpPort) : smtpSecure ? 465 : 587,
        secure: smtpSecure,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: { rejectUnauthorized: false },
      }
    : {
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
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
    }
  }

  res.json(result);
};
