const User = require("../models/User");
const CounsellorAssignment = require("../models/CounsellorAssignment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

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
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: err.message });
  }
};

// Send OTP to user's email for password reset
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Sanitize common env secrets (some deploy UIs insert spaces)
    const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

    // Use explicit SMTP settings when provided (safer for deployments)
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpSecure =
      process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1";

    const transportOptions = smtpHost
      ? {
          host: smtpHost,
          port: smtpPort ? Number(smtpPort) : smtpSecure ? 465 : 587,
          secure: smtpSecure,
          auth: {
            user: process.env.EMAIL_USER,
            pass: emailPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        }
      : {
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: emailPass,
          },
        };

    const transporter = nodemailer.createTransport(transportOptions);

    // Verify transporter connection (useful for debugging in production)
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

    // Try SMTP first if verified, otherwise fall back to SendGrid if configured
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

    if (smtpVerified) {
      try {
        await transporter.sendMail(mailOptions);
      } catch (err) {
        console.error(
          "Failed to send OTP email via SMTP:",
          err && err.stack ? err.stack : err,
        );
        if (process.env.SENDGRID_API_KEY) {
          const ok = await sendViaSendGrid();
          if (!ok) throw err;
        } else {
          throw err;
        }
      }
    } else {
      if (process.env.SENDGRID_API_KEY) {
        const ok = await sendViaSendGrid();
        if (!ok) throw new Error("Both SMTP and SendGrid failed to send email");
      } else {
        throw new Error(
          "SMTP not available and no SendGrid API key configured",
        );
      }
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
