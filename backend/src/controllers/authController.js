const User = require("../models/User");
const CounsellorAssignment = require("../models/CounsellorAssignment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Verify transporter on startup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter error:", error);
  } else {
    console.log("Email transporter is ready");
  }
});

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
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      counsellor: counsellorId,
      otp,
      otpExpires,
      otpVerified: false,
    });
    await user.save();

    // Add assignment if counsilli
    if (role === "counsilli" && counsellorId) {
      await CounsellorAssignment.create({
        counsellor: counsellorId,
        counsilli: user._id,
      });
    }

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP for VIT VOICE Sadhana Registration",
        text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
      });
      res.status(201).json({ message: "Registered. OTP sent to email." });
    } catch (emailErr) {
      await User.deleteOne({ _id: user._id }); // Clean up user if email fails
      if (role === "counsilli" && counsellorId) {
        await CounsellorAssignment.deleteOne({
          counsellor: counsellorId,
          counsilli: user._id,
        });
      }
      res
        .status(500)
        .json({ message: "Failed to send OTP email", error: emailErr.message });
    }
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

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.otp || !user.otpExpires || user.otpExpires < new Date())
      return res
        .status(400)
        .json({ message: "OTP expired. Please register again." });
    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    user.otpVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.json({ message: "OTP verified. Registration complete." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "OTP verification failed", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.otpVerified)
      return res
        .status(400)
        .json({ message: "Invalid credentials or OTP not verified" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Set token expiration to 7 days
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Allow cross-site cookies in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
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
    const user = await User.findById(req.user.userId).select(
      "-password -otp -otpExpires"
    );
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
