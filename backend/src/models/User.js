const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["counsellor", "counsilli"], required: true },
  counsellor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  // Fields for password reset via OTP
  resetOTP: { type: String },
  resetOTPExpires: { type: Date },
});

module.exports = mongoose.model("User", userSchema);
