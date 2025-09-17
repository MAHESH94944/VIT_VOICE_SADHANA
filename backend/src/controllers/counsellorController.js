const User = require("../models/User");
const Sadhana = require("../models/Sadhana");
const CounsellorAssignment = require("../models/CounsellorAssignment");
const mongoose = require("mongoose");

exports.dashboard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("-password");
    if (!user || user.role !== "counsellor") {
      return res.status(403).json({ message: "Access denied" });
    }
    const assignedCount = await CounsellorAssignment.countDocuments({
      counsellor: userId,
    });
    res.json({ user, assignedCounsilliCount: assignedCount });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch dashboard", error: err.message });
  }
};

exports.listCounsillis = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user || user.role !== "counsellor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const assignments = await CounsellorAssignment.aggregate([
      { $match: { counsellor: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "users",
          localField: "counsilli",
          foreignField: "_id",
          as: "counsilliInfo",
        },
      },
      { $unwind: "$counsilliInfo" },
      {
        $lookup: {
          from: "sadhanas",
          localField: "counsilli",
          foreignField: "counsilli",
          as: "sadhanaEntries",
        },
      },
      {
        $project: {
          _id: "$counsilliInfo._id",
          name: "$counsilliInfo.name",
          email: "$counsilliInfo.email",
          role: "$counsilliInfo.role",
          lastSubmission: { $max: "$sadhanaEntries.date" },
        },
      },
    ]);

    res.json({ counsillis: assignments });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch counsillis", error: err.message });
  }
};

exports.counsilliSadhanaReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const user = await User.findById(userId);
    if (!user || user.role !== "counsellor") {
      return res.status(403).json({ message: "Access denied" });
    }
    const assignment = await CounsellorAssignment.findOne({
      counsellor: userId,
      counsilli: id,
    });
    if (!assignment) {
      return res.status(403).json({ message: "Counsilli not assigned to you" });
    }
    const sadhanaCards = await Sadhana.find({ counsilli: id }).sort({
      date: 1,
    });
    res.json({ counsilliId: id, sadhanaCards });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch sadhana report", error: err.message });
  }
};

exports.counsilliMonthlyReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id, month } = req.params;
    const user = await User.findById(userId);
    if (!user || user.role !== "counsellor") {
      return res.status(403).json({ message: "Access denied" });
    }
    const assignment = await CounsellorAssignment.findOne({
      counsellor: userId,
      counsilli: id,
    });
    if (!assignment) {
      return res.status(403).json({ message: "Counsilli not assigned to you" });
    }
    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const sadhanaCards = await Sadhana.find({
      counsilli: id,
      date: { $gte: start, $lt: end },
    }).sort({ date: 1 });

    res.json({ counsilliId: id, month, sadhanaCards });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch monthly report", error: err.message });
  }
};
