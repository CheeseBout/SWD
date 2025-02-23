const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { createUserValidation } = require("../validations/user.validation");
const authController = require("../controllers/auth.controller");
const appConfig = require("../configs/app.config");
const passport = require("passport");

// Public routes
router.post(
  "/register",
  validate(createUserValidation),
  authController.register
);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

router.get(
  "/login/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

router.get(
  "/login/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: appConfig.CLIENT_URL,
  }),
  authController.loginWithGoogle
);

// Protected routes
router.post("/expert-profile", auth, authController.updateExpertProfile);
router.post("/send-verify-email", auth, authController.sendVerifyEmail);
router.post("/verify-email", auth, authController.verifyEmail);
router.post("/update-expert-profile", auth, authController.updateExpertProfile);

module.exports = router;
