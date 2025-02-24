const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createUserValidation,
  emailValidation,
} = require("../validations/user.validation");
const authController = require("../controllers/auth.controller");
const appConfig = require("../configs/app.config");
const passport = require("passport");
const {
  forgotPasswordValidation,
  resetPasswordValidation,
  updateExpertProfileValidation,
} = require("../validations/auth.validation");

// Public routes
router.post(
  "/register",
  validate(createUserValidation),
  authController.register
);
router.post("/login", authController.login);
router.post(
  "/forgot-password",
  validate(forgotPasswordValidation),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  validate(resetPasswordValidation),
  authController.resetPassword
);

router.get(
  "/login/google",
  passport.authenticate("google", {
    scope: [
      "email",
      "profile",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.settings.readonly",
      "https://www.googleapis.com/auth/meetings.space.created",
    ],
    accessType: "offline",
    prompt: "consent",
  })
);

router.get(
  "/login/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${appConfig.CLIENT_URL}?error=google_login_failed`,
  }),
  authController.loginWithGoogle
);

// Protected routes
router.post(
  "/send-verify-email",
  auth,
  validate(emailValidation),
  authController.sendVerifyEmail
);
router.post(
  "/verify-email",
  auth,
  validate(emailValidation),
  authController.verifyEmail
);
router.post(
  "/update-expert-profile",
  auth,
  validate(updateExpertProfileValidation),
  authController.updateExpertProfile
);

module.exports = router;
