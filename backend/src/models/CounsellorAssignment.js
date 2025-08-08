const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  counsellor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  counsilli: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("CounsellorAssignment", assignmentSchema);
