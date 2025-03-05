const { getAuthURL, saveToken } = require("../configs/googleAuth.config");
const authServices = require("../services/auth.services");
const { createTokenPair } = require("../services/token.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");
const config = require("../configs/app.config");
const APIError = require("../utils/ApiError");
const passport = require("passport");

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
}

module.exports = new AuthController();
