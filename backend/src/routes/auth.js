const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Google login endpoint (frontend sends idToken; optional role/counsellorName for first-time users)
router.post("/google-login", authController.googleLogin);

// Traditional email/password login still supported
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware, authController.getMe);

// keep counsellors list (frontend may query to pick counsellor when creating new account)
router.get("/counsellors", authController.getCounsellors);

module.exports = router;
