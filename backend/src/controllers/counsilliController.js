const Sadhana = require("../models/Sadhana");
const User = require("../models/User");

exports.dashboard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("-password");
    // Add role check
    if (!user || user.role !== "counsilli") {
      return res.status(403).json({ message: "Access denied" });
    }
    const latestSadhana = await Sadhana.find({ counsilli: userId })
      .sort({ date: -1 })
      .limit(7);
    res.json({ user, recentSadhana: latestSadhana });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch dashboard", error: err.message });
  }
};

exports.addSadhana = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user || user.role !== "counsilli") {
      return res
        .status(403)
        .json({ message: "Only counsilli can add sadhana card" });
    }
    const {
      date,
      wakeUp,
      japaCompleted,
      dayRest,
      hearing,
      reading,
      study,
      timeToBed,
      seva,
      concern,
    } = req.body;

    // Check for duplicate entry on the same day
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingSadhana = await Sadhana.findOne({
      counsilli: userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (existingSadhana) {
      return res.status(409).json({
        message: "A sadhana card for this date has already been submitted.",
      });
    }

    const sadhana = new Sadhana({
      counsilli: userId,
      date,
      wakeUp,
      japaCompleted,
      dayRest,
      hearing,
      reading,
      study,
      timeToBed,
      seva,
      concern,
    });

    await sadhana.save();
    res.status(201).json({ message: "Sadhana card added", sadhana });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add sadhana card", error: err.message });
  }
};

exports.monthlyReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month } = req.params; // format: YYYY-MM
    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const sadhanaCards = await Sadhana.find({
      counsilli: userId,
      date: { $gte: start, $lt: end },
    }).sort({ date: 1 });

    res.json({ month, sadhanaCards });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch monthly report", error: err.message });
  }
};

