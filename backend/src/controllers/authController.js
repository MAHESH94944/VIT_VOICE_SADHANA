const User = require("../models/User");
const CounsellorAssignment = require("../models/CounsellorAssignment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function createAndSendToken(user, res) {
  // create JWT and set cookie (same behavior as before)
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
}

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

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

exports.getCounsellors = async (req, res) => {
  try {
    // Return only counsellors who have logged in at least once (lastLogin exists)
    const counsellors = await User.find({
      role: "counsellor",
      lastLogin: { $exists: true },
    }).select("name _id");
    res.json(counsellors);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch counsellors", error: err.message });
  }
};

// New google-login endpoint
exports.googleLogin = async (req, res) => {
  const { idToken, role, counsellorName } = req.body;
  try {
    if (!idToken) return res.status(400).json({ message: "idToken required" });
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name || payload.email.split("@")[0];

    let user = await User.findOne({ email });
    if (user) {
      // existing user: update lastLogin and login
      user.lastLogin = new Date();
      await user.save();
      const token = createAndSendToken(user, res);
      return res.json({
        message: "Login successful",
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // new user: if frontend supplied role, create user; otherwise ask frontend to collect role
    if (!role) {
      return res.status(200).json({ needRole: true, email, name });
    }

    let counsellorId;
    if (role === "counsilli") {
      if (!counsellorName) {
        return res
          .status(400)
          .json({ message: "Counsellor name required for counsilli" });
      }
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

    // create user (password optional for Google users)
    const newUser = new User({
      name,
      email,
      password: undefined,
      role,
      counsellor: counsellorId,
      lastLogin: new Date(), // mark as logged in immediately
    });
    await newUser.save();

    // add assignment if counsilli
    if (role === "counsilli" && counsellorId) {
      await CounsellorAssignment.create({
        counsellor: counsellorId,
        counsilli: newUser._id,
      });
    }

    const token = createAndSendToken(newUser, res);
    return res.status(201).json({
      message: "User created and logged in",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res
      .status(500)
      .json({ message: "Google login failed", error: err.message });
  }
};

// Modified traditional login: remove OTP checks (support password auth as fallback)
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // If user has no password (Google-only account) deny password login
    if (!user.password)
      return res
        .status(400)
        .json({ message: "Use Google Sign-In for this account" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // update lastLogin
    user.lastLogin = new Date();
    await user.save();

    const token = createAndSendToken(user, res);
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
    res.json({ user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: err.message });
  }
};
