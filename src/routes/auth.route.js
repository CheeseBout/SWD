const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { createUserValidation } = require("../validations/user.validation");
const authController = require("../controllers/auth.controller");

// Public routes
router.post(
  "/register",
  validate(createUserValidation),
  authController.register
);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected routes
router.post("/expert-profile", auth, authController.updateExpertProfile);
router.post("/send-verify-email", auth, authController.sendVerifyEmail);
router.post("/verify-email", auth, authController.verifyEmail);
router.post("/update-expert-profile", auth, authController.updateExpertProfile);
router.get("/google-auth", authController.authGoogle);
router.get("/google-callback", authController.authCallBack);

module.exports = router;
