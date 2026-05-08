const User = require("../models/User");
const CounsellorAssignment = require("../models/CounsellorAssignment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const axios = require("axios");

exports.register = async (req, res) => {
  const { name, email, password, role, counsellorName } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    let counsellorId;
    if (role === "counsilli") {
      if (!counsellorName)
        return res.status(400).json({
          message: "Counsellor name is required for counsilli registration",
        });
      const counsellorUser = await User.findOne({
        name: counsellorName,
        role: "counsellor",
      });
      if (!counsellorUser)
        return res
          .status(400)
          .json({ message: "Counsellor with this name does not exist" });
      counsellorId = counsellorUser._id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      counsellor: counsellorId,
    });
    await user.save();

    // Add assignment if counsilli
    if (role === "counsilli" && counsellorId) {
      await CounsellorAssignment.create({
        counsellor: counsellorId,
        counsilli: user._id,
      });
    }

    // Return success — frontend should redirect to login page
    res.status(201).json({ message: "Registered successfully. Please login." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

exports.getCounsellors = async (req, res) => {
  try {
    const counsellors = await User.find({ role: "counsellor" }).select("name");
    res.json(counsellors);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch counsellors", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }, // Set token expiration to 7 days
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Logged out successfully" });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: err.message });
  }
};

// Request password reset: generate OTP, save to user, and send via SMTP/SendGrid/Brevo
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: (process.env.EMAIL_PASS || "").replace(/\s+/g, ""),
      },
    });

    // Verify transporter
    let smtpVerified = true;
    try {
      await transporter.verify();
      console.log("SMTP transporter verified");
    } catch (verifyErr) {
      smtpVerified = false;
      console.error(
        "SMTP transporter verification failed:",
        verifyErr && verifyErr.stack ? verifyErr.stack : verifyErr,
      );
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: user.email,
      subject: "Password reset OTP",
      text: `Your password reset OTP is ${otp}. It expires in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color:#f97316">VIT VOICE Sadhana — Password Reset</h2>
          <p>Hi ${user.name || "user"},</p>
          <p>Use the following One Time Password (OTP) to reset your password. It will expire in 15 minutes.</p>
          <div style="margin: 18px 0; padding: 12px 18px; background: #fff7ed; border-radius: 8px; display: inline-block; font-size: 20px; letter-spacing: 4px; font-weight: 700; color:#b45309">${otp}</div>
          <p style="color: #666; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
          <p style="margin-top: 10px; font-size:13px; color:#888">— VIT VOICE Sadhana</p>
        </div>
      `,
    };

    async function sendViaSendGrid() {
      try {
        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        await sgMail.send({
          to: user.email,
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          subject: mailOptions.subject,
          text: mailOptions.text,
          html: mailOptions.html,
        });
        console.log("OTP sent via SendGrid fallback");
        return true;
      } catch (sgErr) {
        console.error(
          "SendGrid fallback failed:",
          sgErr && sgErr.stack ? sgErr.stack : sgErr,
        );
        return false;
      }
    }

    async function sendViaBrevo() {
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
          to: [{ email: user.email }],
          subject: mailOptions.subject,
          htmlContent: mailOptions.html,
          textContent: mailOptions.text,
        };

        const r = await axios.post(
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
        console.log("OTP sent via Brevo fallback", r.status);
        return true;
      } catch (bErr) {
        console.error(
          "Brevo fallback failed:",
          bErr?.response?.data || bErr?.message || bErr,
        );
        return false;
      }
    }

    if (smtpVerified) {
      try {
        await transporter.sendMail(mailOptions);
      } catch (err) {
        console.error(
          "Failed to send OTP email via SMTP:",
          err && err.stack ? err.stack : err,
        );
        let sent = false;
        if (process.env.SENDGRID_API_KEY) sent = await sendViaSendGrid();
        if (!sent && process.env.BREVO_API_KEY) sent = await sendViaBrevo();
        if (!sent) throw err;
      }
    } else {
      let sent = false;
      if (process.env.SENDGRID_API_KEY) sent = await sendViaSendGrid();
      if (!sent && process.env.BREVO_API_KEY) sent = await sendViaBrevo();
      if (!sent)
        throw new Error(
          "SMTP not available and no SendGrid/Brevo could send email",
        );
    }

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};

exports.verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.resetOTP)
      return res.status(400).json({ message: "Invalid or expired OTP" });
    if (user.resetOTPExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });
    if (user.resetOTP !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    // OTP is valid
    res.json({ message: "OTP verified" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "OTP verification failed", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.resetOTP)
      return res.status(400).json({ message: "Invalid or expired OTP" });
    if (user.resetOTPExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });
    if (user.resetOTP !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Password reset failed", error: err.message });
  }
};
