const express = require("express");
const router = express.Router();
const debugController = require("../controllers/debugController");

// GET /api/debug/email?secret=...&send=true&to=you@example.com
router.get("/email", debugController.testEmail);

module.exports = router;
