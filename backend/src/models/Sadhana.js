const mongoose = require("mongoose");

const sadhanaSchema = new mongoose.Schema({
  counsilli: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, required: true },
  wakeUp: String,
  japaCompleted: String,
  dayRest: String,
  hearing: String,
  reading: String,
  study: String,
  timeToBed: String,
  seva: String,
  concern: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Sadhana", sadhanaSchema);
module.exports = mongoose.model("Sadhana", sadhanaSchema);
