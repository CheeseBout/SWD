const express = require("express");
const router = express.Router();
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
const { auth } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication management APIs
 */

// Public routes
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - username
 *               - email
 *               - password
 *               - dob
 *               - gender
 *               - role
 *             properties:
 *               fullname:
 *                 type: string
 *                 example: "Chu Phan Nhật Long"
 *               username:
 *                 type: string
 *                 example: "dtrong206"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "dtrong206@gmail.com"
 *               address:
 *                 type: string
 *                 example: "HCM"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Abc12345@"
 *                 minLength: 8
 *                 description: Must contain at least 8 characters, one uppercase, one lowercase, one number and one special character
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "06/11/2004"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: "male"
 *               role:
 *                 type: string
 *                 enum: [member, couple_therapist, admin]
 *                 example: "couple_therapist"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     fullname:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation error"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.post(
  "/register",
  validate(createUserValidation),
  authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send forgot password email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset password email sent
 *       404:
 *         description: Email not found
 */
router.post(
  "/forgot-password",
  validate(forgotPasswordValidation),
  authController.forgotPassword
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token
 */
router.post(
  "/reset-password",
  validate(resetPasswordValidation),
  authController.resetPassword
);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Invalid current password
 */
router.post(
  "/change-password",
  validate(changePasswordValidation),
  auth,
  authController.changePassword
);

/**
 * @swagger
 * /auth/login/google:
 *   get:
 *     summary: Google OAuth login redirect
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to Google login
 */
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

/**
 * @swagger
 * /auth/google-login:
 *   post:
 *     summary: Mobile Google login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid token
 */
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

/**
 * @swagger
 * /auth/send-verify-email:
 *   post:
 *     summary: Send email verification
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification email sent
 */
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

/**
 * @swagger
 * /auth/update-expert-profile:
 *   post:
 *     summary: Update expert profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expertise:
 *                 type: string
 *               experience:
 *                 type: number
 *               qualification:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/update-expert-profile",
  auth,
  validate(updateExpertProfileValidation),
  authController.updateExpertProfile
);

module.exports = router;
