const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ["counsellor", "counsilli"], required: true },
  counsellor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  lastLogin: { type: Date },
});

module.exports = mongoose.model("User", userSchema);
