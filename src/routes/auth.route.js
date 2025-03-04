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
  changePasswordValidation,
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
router.post(
  "/change-password",
  validate(changePasswordValidation),
  auth,
  authController.changePassword
);

// OAuth Redirect for Web
router.get(
  "/login/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
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
  authController.authCallBack
);

// API Google Login for Mobile
router.post("/google-login", authController.loginWithGoogle);

// DEBUG only - remove in production
router.get("/debug/google-config", (req, res) => {
  res.json({
    clientIDs: {
      web: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + "...",
      android:
        process.env.GOOGLE_ANDROID_CLIENT_ID?.substring(0, 10) + "..." ||
        "not set",
      ios:
        process.env.GOOGLE_IOS_CLIENT_ID?.substring(0, 10) + "..." || "not set",
    },
    note: "This endpoint should be removed in production",
  });
});

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
