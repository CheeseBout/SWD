const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const auth = require("../middlewares/auth.middleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected routes
router.post("/expert-profile", auth, authController.updateExpertProfile);
router.post("/send-verify-email", auth, authController.sendVerifyEmail);
router.post("/verify-email", auth, authController.verifyEmail);
router.post("/update-expert-profile", auth, authController.updateExpertProfile);

module.exports = router;
