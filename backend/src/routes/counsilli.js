const express = require("express");
const router = express.Router();
const counsilliController = require("../controllers/counsilliController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/dashboard", authMiddleware, counsilliController.dashboard);
router.post("/sadhana/add", authMiddleware, counsilliController.addSadhana);
router.get(
  "/sadhana/monthly/:month",
  authMiddleware,
  counsilliController.monthlyReport
);

module.exports = router;
