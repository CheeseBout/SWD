const Joi = require("joi");

const forgotPasswordValidation = {
  body: Joi.object().keys({
    email: Joi.string()
      .required()
      .pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
      .message("Email must be a valid Gmail address"),
  }),
};

const resetPasswordValidation = {
  body: Joi.object().keys({
    password: Joi.string()
      .required()
      .min(8)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$"
        )
      )
      .message(
        "Password must be at least 8 characters, including uppercase, lowercase, number and symbol"
      ),
    resetToken: Joi.string().required(),
    email: Joi.string()
      .required()
      .pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
      .message("Email must be a valid Gmail address"),
  }),
};

const changePasswordValidation = {
  body: Joi.object().keys({
    oldPassword: Joi.string()
      .required()
      .min(8)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$"
        )
      )
      .message(
        "Old Password must be at least 8 characters, including uppercase, lowercase, number and symbol"
      ),
    newPassword: Joi.string()
      .required()
      .min(8)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$"
        )
      )
      .message(
        "New Password must be at least 8 characters, including uppercase, lowercase, number and symbol"
      ),
  }),
};

const updateExpertProfileValidation = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    issuedDate: Joi.string().required(),
    expiryDate: Joi.string().required(),
    documentURL: Joi.string().uri().required(),
    category: Joi.string().required(),
  }),
};

const emailVerificationValidation = {
  body: Joi.object().keys({
    email: Joi.string()
      .required()
      .pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
      .message("Email must be a valid Gmail address"),
    emailVerificationToken: Joi.string().required(),
  }),
};

module.exports = {
  forgotPasswordValidation,
  resetPasswordValidation,
  updateExpertProfileValidation,
  changePasswordValidation,
  emailVerificationValidation,
};
