const { getAuthURL, saveToken } = require("../configs/googleAuth.config");
const authServices = require("../services/auth.services");
const { createTokenPair } = require("../services/token.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");
const config = require("../configs/app.config");
const APIError = require("../utils/ApiError");
const passport = require("passport");
const {
  getAuthUrl,
  SCOPES,
  oauth2Client,
} = require("../configs/googleMeet.config");
const appConfig = require("../configs/app.config");
const GoogleTokenService = require("../services/googleToken.services");

const authGoogle = passport.authenticate("google", {
  scope: [
    "email",
    "profile",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "openid",
  ],
  accessType: "offline",
  prompt: "consent",
});

class AuthController {
  register = catchAsync(async (req, res) => {
    const {
      fullname,
      username,
      email,
      password,
      address,
      dob,
      gender,
      photoURL,
      role,
    } = req.body;

    // Create user first
    const result = await authServices.register({
      fullname,
      username,
      email,
      address,
      password,
      dob,
      gender,
      photoURL,
      role: role || "member", // Default to member if no role specified
    });

    // Create therapist profile if role is couple_therapist
    if (role === "couple_therapist" && result?.user?._id) {
      try {
        const therapistProfile = await authServices.createTherapistProfile(
          result.user._id
        );
        return OK(res, "Registration successful", {
          user: result.user,
          therapistProfile,
        });
      } catch (error) {
        // If therapist profile creation fails, still return the user but with an error message
        return OK(
          res,
          "User registered but therapist profile creation failed",
          {
            user: result.user,
            error: error.message,
          }
        );
      }
    }

    return OK(res, "Registration successful", result);
  });

  updateExpertProfile = catchAsync(async (req, res) => {
    const {
      title,
      issuedDate,
      expiryDate,
      documentURL,
      description,
      category,
    } = req.body;
    const userId = req.user._id;
    const result = await authServices.updateExpertProfile(userId, {
      title,
      issuedDate,
      expiryDate,
      documentURL,
      description,
      category,
    });
    return OK(res, "Expert profile updated successfully", result);
  });

  login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const result = await authServices.login({ email, password });
    return OK(res, "Success", result);
  });

  sendVerifyEmail = catchAsync(async (req, res) => {
    const { email } = req.body;
    const result = await authServices.sendVerifyEmail({ email });
    return OK(res, "Success", result);
  });

  verifyEmail = catchAsync(async (req, res) => {
    const { token } = req.query;
    const { email } = req.body;
    const result = await authServices.verifyEmail({ email, token });
    return OK(res, "Success", result);
  });

  forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    const result = await authServices.forgotPassword({ email });
    return OK(res, "Success", result);
  });

  resetPassword = catchAsync(async (req, res) => {
    const { resetToken, email, password } = req.body;
    const result = await authServices.resetPassword({
      resetToken,
      email,
      password,
    });
    return OK(res, "Success", result);
  });

  changePassword = catchAsync(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;
    const result = await authServices.changePassword({
      userId,
      oldPassword,
      newPassword,
    });
    return OK(res, "Success", result);
  });

  /**
   * Google OAuth Callback for Web
   */
  authCallBack = async (req, res) => {
    try {
      console.log("Auth callback received:", {
        hasUser: !!req.user,
        hasTokens: req.user && !!req.user.tokens,
        code: req.query.code ? req.query.code.substring(0, 10) + "..." : "none",
        scope: req.query.scope || "none",
        state: req.query.state || "none",
      });

      // Parse state if available to get user info
      let stateData = {};
      let userId = null;

      try {
        if (req.query.state) {
          stateData = JSON.parse(req.query.state);
          console.log("Parsed state data:", stateData);

          if (stateData.userId) {
            userId = stateData.userId;
          }
        }
      } catch (stateError) {
        console.error("Failed to parse state:", stateError);
      }

      // Check if this is for calendar authorization specifically
      const isCalendarAuth =
        stateData.isCalendarAuth === true ||
        (req.query.scope && req.query.scope.includes("calendar"));

      if (isCalendarAuth && req.query.code) {
        try {
          // Handle calendar authorization differently
          console.log("Processing calendar authorization with code");

          // Verify that userId exists in the database
          const USER = require("../models/user.model");

          if (!userId) {
            console.error("No userId found in state data for calendar auth");
            return res.redirect(
              `${config.CLIENT_URL}/profile/connect?error=missing_user_id`
            );
          }

          const userExists = await USER.findOne({ _id: userId });
          if (!userExists) {
            console.error(`User with ID ${userId} not found in database`);
            return res.redirect(
              `${config.CLIENT_URL}/login?error=user_not_found`
            );
          }
          console.log(`User ${userId} verified in database`);

          // Get tokens directly from Google
          const meetConfig = require("../configs/googleMeet.config");
          const code = req.query.code;
          console.log("Code length:", code.length);

          // Exchange code for token
          const tokenResponse = await meetConfig.getToken(code);

          if (!tokenResponse.success || !tokenResponse.tokens) {
            console.error("Token exchange failed:", tokenResponse.error);
            console.error(
              "Error details:",
              tokenResponse.message || "Unknown error"
            );
            console.error("Full error object:", JSON.stringify(tokenResponse));

            throw new Error(
              "Failed to exchange authorization code: " +
                (tokenResponse.message || "Unknown error")
            );
          }

          const tokens = tokenResponse.tokens;
          console.log("Calendar tokens received successfully");

          // Save tokens to DB
          await GoogleTokenService.saveGoogleToken(userId, tokens);
          console.log("Google token saved successfully for user", userId);

          // Determine redirect path
          const redirectPath = stateData.redirectPath || "/profile/connect";

          // Redirect to success page
          return res.redirect(
            `${config.CLIENT_URL}${redirectPath}?googleConnectSuccess=true`
          );
        } catch (calendarError) {
          console.error("Calendar auth error:", calendarError);
          console.error("Error details:", calendarError.stack);

          return res.redirect(
            `${
              config.CLIENT_URL
            }/profile/connect?googleConnectError=${encodeURIComponent(
              calendarError.message || "Unknown error"
            )}`
          );
        }
      }

      // Regular login flow continues
      if (!req.user || !req.user.tokens) {
        console.error("No user data found in request");
        return res.redirect(
          `${config.CLIENT_URL}/login?error=missing_user_data`
        );
      }

      // Safely access session data
      const requestedRole = req.session?.requestedRole || "member";
      console.log("Session data:", {
        requestedRole,
        sessionId: req.sessionID,
        hasSession: !!req.session,
      });

      const { tokens } = req.user;

      console.log("Debug - Auth Callback:", {
        sessionData: req.session,
        requestedRole: requestedRole,
        hasTokens: !!tokens,
      });

      if (!tokens.id_token) {
        console.error("No ID token found:", tokens);
        return res.redirect(
          `${config.CLIENT_URL}/login?error=missing_id_token`
        );
      }

      // Truyền role vào hàm loginWithGoogle
      const result = await authServices.loginWithGoogle(
        tokens.id_token,
        requestedRole || "member"
      );

      // Debug log
      console.log("Auth result:", {
        hasUser: !!result.user,
        hasTokens: !!(result.accessToken && result.refreshToken),
      });

      if (!result?.user || !result?.accessToken) {
        console.error("Invalid login result:", result);
        return res.redirect(
          `${config.CLIENT_URL}/login?error=invalid_login_result`
        );
      }

      // Construct redirect URL with tokens
      const redirectUrl = new URL(`${config.CLIENT_URL}`);
      redirectUrl.searchParams.append("accessToken", result.accessToken);
      redirectUrl.searchParams.append("refreshToken", result.refreshToken);
      redirectUrl.searchParams.append("success", "true");

      // Optional: Add minimal user info
      redirectUrl.searchParams.append("userId", result.user._id);
      redirectUrl.searchParams.append("role", result.user.role);

      // If we get here, it's a normal login flow
      return res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error("Google callback error:", error);
      return res.redirect(
        `${
          config.CLIENT_URL
        }/login?error=callback_failed&message=${encodeURIComponent(
          error.message
        )}`
      );
    }
  };

  /**
   * Google Login API for Mobile & Web (Using idToken)
   */
  loginWithGoogle = async (req, res) => {
    try {
      const { idToken } = req.body;
      const role = req.params.role;

      if (!idToken) {
        throw new APIError("Missing Google ID Token", 400);
      }

      const result = await authServices.loginWithGoogle(idToken, role);
      return OK(res, "Google login successful", result);
    } catch (error) {
      console.error("Google login error:", error);
      return res.status(error.status || 500).json({ message: error.message });
    }
  };

  getTherapistGoogleAuthUrl = catchAsync(async (req, res) => {
    const result = await authServices.getTherapistGoogleAuthUrl(req);
    return OK(res, "Google authentication URL generated", result);
  });

  getTherapistDirectConnection = catchAsync(async (req, res) => {
    if (req.user.role !== "couple_therapist") {
      return res.status(403).json({
        status: "error",
        message: "Only therapists can connect Google accounts",
      });
    }

    // Tạo state chứa thông tin user để dùng trong callback
    const state = JSON.stringify({
      userId: req.user._id.toString(),
      isCalendarAuth: true,
      redirectPath: "/profile/connect",
    });

    // Use dedicated calendar callback route
    const calendarCallbackUrl = `${appConfig.API_URL}/api/v1/auth/calendar-callback`;

    console.log("Using calendar callback URL:", calendarCallbackUrl);

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
      state: state,
      redirect_uri: calendarCallbackUrl,
    });

    console.log("Redirecting to Google auth:", authUrl);
    res.redirect(authUrl);
  });

  calendarAuth = catchAsync(async (req, res) => {
    if (req.user.role !== "couple_therapist") {
      return res.status(403).json({
        status: "error",
        message: "Only therapists can access this endpoint",
      });
    }

    // Import calendar scopes specific config
    const authUrl = getAuthUrl();

    // Redirect to Google auth with calendar scopes
    res.redirect(authUrl);
  });

  /**
   * Get therapist Google auth URL as JSON response instead of redirect
   */
  getTherapistGoogleAuthUrlJSON = catchAsync(async (req, res) => {
    if (req.user.role !== "couple_therapist") {
      return res.status(403).json({
        status: "error",
        message: "Only therapists can connect Google accounts",
      });
    }

    // Tạo state chứa thông tin user để dùng trong callback
    const state = JSON.stringify({
      userId: req.user._id.toString(),
      isCalendarAuth: true,
      redirectPath: "/profile/connect",
    });

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
      state: state,
      redirect_uri: appConfig.GOOGLEMEETAPI.CALLBACK_URL,
    });

    console.log("Generated Google auth URL:", authUrl);

    // Return the URL as JSON instead of redirecting
    return OK(res, "Google authentication URL generated", {
      authUrl,
      note: "Open this URL in a new tab/window to connect your Google account",
    });
  });

  /**
   * Creates a connection URL that includes the token as a query parameter
   * Useful for frontend redirecting
   */
  createGoogleConnectUrl = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const userRole = req.user.role;

    if (userRole !== "couple_therapist") {
      return res.status(403).json({
        status: "error",
        message: "Only therapists can connect Google accounts",
      });
    }

    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "No authentication token provided",
      });
    }

    // Create two types of URLs

    // 1. Direct URL with token in query parameter
    const directConnectUrl = `${appConfig.API_URL}/api/v1/auth/therapist-direct-connect?token=${token}`;

    // 2. Intermediate page URL
    const intermediatePageUrl = `${appConfig.API_URL}/api/v1/auth/connect-google-calendar?token=${token}`;

    // 3. URL for the frontend to open in new tab/window
    const authUrl = await authServices.getTherapistGoogleAuthUrl(req);

    return OK(res, "Google connection URLs created successfully", {
      directConnectUrl,
      intermediatePageUrl,
      authUrl: authUrl.googleAuthUrl,
      note: "You can use any of these URLs to connect your Google account. The intermediatePageUrl is recommended for user-friendly experience.",
    });
  });

  /**
   * Handle Google Calendar callback from Google OAuth
   */
  handleCalendarCallback = catchAsync(async (req, res) => {
    console.log(
      "Calendar callback received with code:",
      req.query.code?.substring(0, 10) + "..."
    );

    if (!req.query.code) {
      return res.redirect(
        `${config.CLIENT_URL}/profile/connect?error=no_code_received`
      );
    }

    if (!req.query.state) {
      return res.redirect(
        `${config.CLIENT_URL}/profile/connect?error=no_state_received`
      );
    }

    // Parse state to get user ID and other info
    let stateData = {};
    try {
      stateData = JSON.parse(req.query.state);
      console.log("Calendar callback state data:", stateData);
    } catch (err) {
      console.error("Failed to parse state:", err);
      return res.redirect(
        `${config.CLIENT_URL}/profile/connect?error=invalid_state`
      );
    }

    if (!stateData.userId) {
      return res.redirect(
        `${config.CLIENT_URL}/profile/connect?error=no_user_id`
      );
    }

    // Verify user exists
    const USER = require("../models/user.model");
    const userId = stateData.userId;
    const user = await USER.findOne({ _id: userId });

    if (!user) {
      return res.redirect(`${config.CLIENT_URL}/login?error=user_not_found`);
    }

    // Exchange code for token
    const meetConfig = require("../configs/googleMeet.config");
    const tokenResponse = await meetConfig.getToken(req.query.code);

    if (!tokenResponse.success) {
      console.error("Token exchange failed:", tokenResponse.error);
      return res.redirect(
        `${config.CLIENT_URL}/profile/connect?error=${encodeURIComponent(
          tokenResponse.message || "token_exchange_failed"
        )}`
      );
    }

    // Save the tokens
    await GoogleTokenService.saveGoogleToken(userId, tokenResponse.tokens);

    // Cập nhật User model để đánh dấu đã kết nối Google
    await USER.findByIdAndUpdate(userId, {
      isGoogleUser: true,
      updatedAt: new Date(),
    });

    // Redirect to success page
    const redirectPath = stateData.redirectPath || "/profile/connect";
    return res.redirect(
      `${config.CLIENT_URL}${redirectPath}?googleConnectSuccess=true`
    );
  });

  /**
   * Check Google Calendar connection status
   */
  checkGoogleConnectionStatus = catchAsync(async (req, res) => {
    const GoogleTokenService = require("../services/googleToken.services");
    const connectionStatus = await GoogleTokenService.checkGoogleConnection(
      req.user._id
    );
    return OK(
      res,
      connectionStatus.isConnected
        ? "Google Calendar is connected"
        : "Google Calendar is not connected",
      connectionStatus
    );
  });

  /**
   * Test Google token functionality by making an API call
   */
  testGoogleToken = catchAsync(async (req, res) => {
    // Only allow admins or the user themselves
    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== req.params.userId
    ) {
      return res.status(403).json({
        status: "error",
        message: "Permission denied",
      });
    }

    const userId = req.params.userId;
    const googleTokenService = require("../services/googleToken.services");
    const googleToken = await googleTokenService.getGoogleToken(userId);

    if (!googleToken) {
      return res.json({
        status: "error",
        message: "No Google token found for this user",
      });
    }

    try {
      // Test the token by making a simple API call
      const { createCalendarClient } = require("../configs/googleMeet.config");
      const oauth2Client = createCalendarClient(googleToken);
      const { google } = require("googleapis");
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });
      const response = await calendar.calendarList.list();

      return res.json({
        status: "success",
        message: "Google token is valid",
        data: {
          tokenInfo: {
            hasAccessToken: !!googleToken.access_token,
            hasRefreshToken: !!googleToken.refresh_token,
            tokenExpiry: googleToken.expiry_date
              ? new Date(googleToken.expiry_date)
              : null,
          },
          calendarList: response.data.items.slice(0, 3), // Show just first 3 calendars
        },
      });
    } catch (apiError) {
      return res.json({
        status: "error",
        message: "Token exists but API call failed",
        error: apiError.message,
        tokenInfo: {
          hasAccessToken: !!googleToken.access_token,
          hasRefreshToken: !!googleToken.refresh_token,
          tokenExpiry: googleToken.expiry_date
            ? new Date(googleToken.expiry_date)
            : null,
        },
      });
    }
  });

  /**
   * Display an HTML page that helps connect Google Calendar
   */
  showCalendarConnectPage = (req, res) => {
    const token = req.query.token;

    if (!token) {
      return res.status(400).send("Missing token parameter");
    }

    // Return an HTML page with JavaScript to redirect to the auth endpoint with token
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Connecting to Google Calendar</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          button {
            background: #4285F4;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
          }
          .loader {
            border: 5px solid #f3f3f3;
            border-top: 5px solid #4285F4;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
            display: none;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Kết nối với Google Calendar</h1>
          <p>Nhấn vào nút bên dưới để kết nối tài khoản Google Calendar của bạn. Điều này sẽ giúp bạn tạo các buổi tư vấn trực tuyến.</p>
          
          <div class="loader" id="loader"></div>
          
          <button onclick="connectGoogle()">Kết nối Google Calendar</button>
        </div>
        
        <script>
          function connectGoogle() {
            document.getElementById('loader').style.display = 'block';
            // Redirect to the Google auth endpoint with the token
            window.location.href = '/api/v1/auth/therapist-direct-connect?token=${token}';
          }
        </script>
      </body>
      </html>
    `;

    res.send(html);
  };

  /**
   * Debug user's token information
   */
  debugUserToken = catchAsync(async (req, res) => {
    // Only allow admins to check tokens
    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== req.params.userId
    ) {
      return res.status(403).json({
        status: "error",
        message: "Only admins can check other users' tokens",
      });
    }

    const tokenRepo = require("../repositories/token.repo");
    const result = await tokenRepo.debugToken(req.params.userId);

    return OK(res, "Token debug information", result);
  });
}

module.exports = new AuthController();
