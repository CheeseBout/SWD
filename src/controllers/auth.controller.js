const { getAuthURL, saveToken } = require("../configs/googleAuth.config");
const authServices = require("../services/auth.services");
const { createTokenPair } = require("../services/token.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");
const config = require("../configs/app.config");
const APIError = require("../utils/ApiError");
const passport = require("passport");

const authGoogle = passport.authenticate("google", {
  scope: ["profile", "email"],
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
      const { tokens } = req.user;
      if (!tokens || !tokens.id_token) {
        return res.redirect(`${config.CLIENT_URL}?error=login_failed`);
      }

      const result = await authServices.loginWithGoogle(tokens.id_token);
      return res.json(result);
    } catch (error) {
      console.error("Google login error:", error);
      res.redirect(`${config.CLIENT_URL}?error=login_failed`);
    }
  };

  /**
   * Google Login API for Mobile & Web (Using idToken)
   */
  loginWithGoogle = async (req, res) => {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        throw new APIError("Missing Google ID Token", 400);
      }

      const result = await authServices.loginWithGoogle(idToken);
      return OK(res, "Google login successful", result);
    } catch (error) {
      console.error("Google login error:", error);
      return res.status(error.status || 500).json({ message: error.message });
    }
  };
}

module.exports = new AuthController();
