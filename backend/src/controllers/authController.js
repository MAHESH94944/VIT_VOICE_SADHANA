const User = require("../models/User");
const CounsellorAssignment = require("../models/CounsellorAssignment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
      { expiresIn: "7d" } // Set token expiration to 7 days
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
