const Joi = require("joi");
const getUserByIdValidation = {
  params: Joi.object().keys({
    id: Joi.string()
      .required()
      .pattern(/^[0-9a-zA-Z]{24}$/)
      .message("Invalid id"),
  }),
};

const createUserValidation = {
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
    email: Joi.string()
      .required()
      .pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
      .message("Email must be a valid Gmail address"),
    fullname: Joi.string().required(),
    username: Joi.string().required(),
    dob: Joi.date().required(),
    gender: Joi.string().required(),
    role: Joi.optional().valid("user", "couple_therapist", "admin"),
    photoURL: Joi.string().uri().optional(),
  }),
};

const loginValidation = {
  body: Joi.object().keys({
    email: Joi.string()
      .required()
      .pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
      .message("Email must be a valid Gmail address"),

    password: Joi.string()
      .required()
      .min(8)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&]{8,}$"
        )
      )
      .message(
        "Password must be at least 8 characters, including uppercase, lowercase, number and symbol"
      ),
  }),
};

const emailValidation = {
  body: Joi.object().keys({
    email: Joi.string()
      .required()
      .pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
      .message("Email must be a valid Gmail address"),
  }),
};

const updateProfileValidation = {
  body: Joi.object().keys({
    fullname: Joi.string().min(5).max(50).required(),
    dob: Joi.string()
      .pattern(/^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/)
      .required()
      .messages({
        "string.pattern.base": "Date must be in the format DD/MM/YYYY",
      }),
    photoURL: Joi.string().uri().optional(),
  }),
};

module.exports = {
  getUserByIdValidation,
  createUserValidation,
  loginValidation,
  emailValidation,
};
