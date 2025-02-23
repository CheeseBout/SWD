const { getAuthURL, saveToken } = require("../configs/googleAuth.config");
const authServices = require("../services/auth.services");
const { createTokenPair } = require("../services/token.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");
const config = require("../configs/app.config");
const roleConfig = require("../configs/role.config");
const APIError = require("../utils/ApiError");
const passport = require("passport");

class AuthController {
  register = catchAsync(async (req, res) => {
    const { fullname, username, email, password, dob, gender, photoURL, role } =
      req.body;
    const result = await authServices.register({
      fullname,
      username,
      email,
      password,
      dob,
      gender,
      photoURL,
      role,
    });

    if (role === "couple_therapist") {
      await authServices.createTherapistProfile(result.user._id); // Thay đổi ở đây: result._id -> result.user._id
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

  redirectToGoogleLoginPage = (req, res, next) => {
    const role = req.query.role;
    const failRedirectURL = req.query.failRedirectURL;
    const successRedirectURL = req.query.successRedirectURL;

    if (![roleConfig.MEMBER, roleConfig.COUPLE_THERAPIST].includes(role)) {
      return next(new APIError(400, "Role is invalid"));
    }

    passport.authenticate("google", {
      scope: ["email", "profile"],
      state: `${role},${failRedirectURL},${successRedirectURL}`,
    })(req, res, next);
  };

  loginWithGoogle = catchAsync(async (req, res) => {
    try {
      const result = await authServices.loginWithGoogle(req.user);
      res.redirect(
        `${config.CLIENT_URL}?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`
      );
    } catch (error) {
      res.redirect(`${config.CLIENT_URL}?error=Authentication failed`);
    }
  });
}

module.exports = new AuthController();
