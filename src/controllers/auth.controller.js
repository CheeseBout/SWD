const authServices = require("../services/auth.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

const authController = {
  register: catchAsync(async (req, res) => {
    const { fullname, username, email, password, dob, gender, photoURL, role } =
      req.body;

    return OK(
      res,
      "Registration successful",
      await authServices.register({
        fullname,
        username,
        email,
        password,
        dob,
        gender,
        photoURL,
        role,
      })
    );
  }),

  updateExpertProfile: catchAsync(async (req, res) => {
    const {
      title, // certificate title
      issuedDate, // certificate issue date
      expiryDate, // certificate expiry date
      documentURL, // certificate document URL
      description, // expert description
    } = req.body;

    const userId = req.user._id;

    return OK(
      res,
      "Expert profile updated successfully",
      await authServices.updateExpertProfile(userId, {
        title,
        issuedDate,
        expiryDate,
        documentURL,
        description,
      })
    );
  }),

  login: catchAsync(async (req, res) => {
    const { email, password } = req.body;
    return OK(res, "Success", await authServices.login({ email, password }));
  }),

  sendVerifyEmail: catchAsync(async (req, res) => {
    const { email } = req.body;
    return OK(res, "Success", await authServices.sendVerifyEmail({ email }));
  }),

  verifyEmail: catchAsync(async (req, res) => {
    const { token } = req.query;
    const { email } = req.body;
    return OK(res, "Success", await authServices.verifyEmail({ email, token }));
  }),

  forgotPassword: catchAsync(async (req, res) => {
    const { email } = req.body;
    return OK(res, "Success", await authServices.forgotPassword({ email }));
  }),

  resetPassword: catchAsync(async (req, res) => {
    const { resetToken, email, password } = req.body;
    return OK(
      res,
      "Success",
      await authServices.resetPassword({ resetToken, email, password })
    );
  }),
};

module.exports = authController;
