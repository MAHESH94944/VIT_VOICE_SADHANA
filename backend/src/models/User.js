const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["counsellor", "counsilli"], required: true },
  counsellor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  otp: { type: String },
  otpExpires: { type: Date },
  otpVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
