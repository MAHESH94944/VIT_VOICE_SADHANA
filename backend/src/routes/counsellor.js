const express = require("express");
const router = express.Router();
const counsellorController = require("../controllers/counsellorController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/dashboard", authMiddleware, counsellorController.dashboard);
router.get("/counsillis", authMiddleware, counsellorController.listCounsillis);
router.get(
  "/counsilli/:id/sadhana",
  authMiddleware,
  counsellorController.counsilliSadhanaReport
);
router.get(
  "/counsilli/:id/sadhana/:month",
  authMiddleware,
  counsellorController.counsilliMonthlyReport
);

module.exports = router;
router.get(
  "/counsilli/:id/sadhana",
  authMiddleware,
  counsellorController.counsilliSadhanaReport
);
router.get(
  "/counsilli/:id/sadhana/:month",
  authMiddleware,
  counsellorController.counsilliMonthlyReport
);

module.exports = router;
