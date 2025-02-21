const { getAuthURL, saveToken } = require("../configs/googleAuth.config");
const authServices = require("../services/auth.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

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

  /**
   * Google OAuth2.0
   */
  authGoogle = async (req, res) => {
    const url = getAuthURL();
    res.redirect(url);
  };

  authCallBack = catchAsync(async (req, res) => {
    const { code } = req.query;
    try {
      await saveToken(code);
      res.send("✅ Xác thực thành công! Bạn có thể tạo Google Meet.");
    } catch (error) {
      res.status(500).send("❌ Xác thực thất bại: " + error.message);
    }
  });
}

module.exports = new AuthController();
