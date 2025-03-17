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
  emailVerificationValidation, // Added new validation
} = require("../validations/auth.validation");
const { auth } = require("../middlewares/auth.middleware");
const { google } = require("googleapis");

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
  (req, res, next) => {
    // Store role in session properly
    if (req.query.role) {
      req.session.requestedRole = req.query.role;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
        }
        next();
      });
    } else {
      next();
    }
  },
  passport.authenticate("google", {
    scope: [
      "email",
      "profile",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "openid",
    ],
    accessType: "offline",
    prompt: "select_account consent",
    session: true, // Changed to true
  })
);

/**
 * @swagger
 * /auth/login/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects after processing the OAuth response
 */
router.get(
  "/login/google/callback",
  (req, res, next) => {
    // Handle calendar auth directly without passport if it's present in state
    try {
      if (req.query.state) {
        const stateData = JSON.parse(req.query.state);
        if (stateData.isCalendarAuth && req.query.code) {
          // Skip passport authentication for calendar auth
          return authController.authCallBack(req, res, next);
        }
      }
      // Otherwise, continue with passport for normal logins
      passport.authenticate("google", {
        session: false,
        failureRedirect: `${appConfig.CLIENT_URL}/login?error=google_auth_failed`,
        failureMessage: true,
      })(req, res, next);
    } catch (error) {
      console.error("Error in callback router decision:", error);
      return res.redirect(
        `${
          appConfig.CLIENT_URL
        }/login?error=callback_error&message=${encodeURIComponent(
          error.message
        )}`
      );
    }
  },
  authController.authCallBack
);

/**
 * @swagger
 * /auth/calendar-callback:
 *   get:
 *     summary: Google Calendar OAuth callback
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State data containing userId and other parameters
 *     responses:
 *       302:
 *         description: Redirects back to application after handling calendar auth
 */
router.get("/calendar-callback", authController.handleCalendarCallback);

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

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify user email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - email
 *             properties:
 *               token:
 *                 type: string
 *                 description: Verification token sent to email
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid token or email
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/verify-email",
  validate(emailVerificationValidation), // Change to use the new validation
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

/**
 * @swagger
 * /auth/therapist-google-connect:
 *   get:
 *     summary: Get Google authentication URL for therapists (only needed once)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Google authentication URL generated or status if already connected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Google authentication URL generated
 *                 data:
 *                   type: object
 *                   properties:
 *                     authUrl:
 *                       type: string
 *                       example: https://accounts.google.com/o/oauth2/auth?...
 *                     note:
 *                       type: string
 *                       example: After connecting, you'll be able to create meetings without further authentication
 *                     status:
 *                       type: string
 *                       example: connected
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User is not a therapist
 */
router.get(
  "/therapist-google-connect",
  auth,
  authController.getTherapistGoogleAuthUrl
);

/**
 * @swagger
 * /auth/therapist-direct-connect:
 *   get:
 *     summary: Direct connection to Google Calendar API
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       302:
 *         description: Redirects to Google authorization
 */
router.get(
  "/therapist-direct-connect",
  auth,
  authController.getTherapistDirectConnection
);

/**
 * @swagger
 * /auth/calendar-auth:
 *   get:
 *     summary: Connect Google Calendar for therapists (one-time setup)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       302:
 *         description: Redirects to Google authorization
 */
router.get("/calendar-auth", auth, authController.calendarAuth);

/**
 * @swagger
 * /auth/debug-user-tokens/{userId}:
 *   get:
 *     summary: Debug user tokens (admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to check tokens for
 *     responses:
 *       200:
 *         description: Token debug information
 */
router.get("/debug-user-tokens/:userId", auth, authController.debugUserToken);

/**
 * @swagger
 * /auth/therapist-google-auth-url:
 *   get:
 *     summary: Get Google authentication URL for therapists (as JSON response)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Google authentication URL generated as JSON
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Google authentication URL generated
 *                 data:
 *                   type: object
 *                   properties:
 *                     authUrl:
 *                       type: string
 *                       example: https://accounts.google.com/o/oauth2/auth?...
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User is not a therapist
 */
router.get(
  "/therapist-google-auth-url",
  auth,
  authController.getTherapistGoogleAuthUrlJSON
);

/**
 * @swagger
 * /auth/create-google-connect-url:
 *   get:
 *     summary: Create URLs for connecting Google Calendar with token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Connection URLs generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     directConnectUrl:
 *                       type: string
 *                     intermediatePageUrl:
 *                       type: string
 *                     authUrl:
 *                       type: string
 */
router.get(
  "/create-google-connect-url",
  auth,
  authController.createGoogleConnectUrl
);

/**
 * @swagger
 * /auth/connect-google-calendar:
 *   get:
 *     summary: HTML page to help connect Google Calendar
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: User's auth token
 *     responses:
 *       200:
 *         description: HTML page with redirection script
 */
router.get("/connect-google-calendar", authController.showCalendarConnectPage);

/**
 * @swagger
 * /auth/test-google-token/{userId}:
 *   get:
 *     summary: Test Google token functionality (admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to test token for
 *     responses:
 *       200:
 *         description: Google token test results
 */
router.get("/test-google-token/:userId", auth, authController.testGoogleToken);

/**
 * @swagger
 * /auth/google-connection-status:
 *   get:
 *     summary: Check Google Calendar connection status
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns connection status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     isConnected:
 *                       type: boolean
 *                     isGoogleUser:
 *                       type: boolean
 *                     hasToken:
 *                       type: boolean
 */
router.get(
  "/google-connection-status",
  auth,
  authController.checkGoogleConnectionStatus
);

router.put(
  "/update-therapist-profile",
  auth,
  authController.updateTherapistProfile
);

module.exports = router;
