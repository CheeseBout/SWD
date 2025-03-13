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
      .pattern(new RegExp())
      .message(
        "Password must be at least 8 characters, including uppercase, lowercase, number and symbol"
      ),
    email: Joi.string()
      .required()
      .pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
      .message("Email must be a valid Gmail address"),
    fullname: Joi.string()
      .required()
      .min(3)
      .max(50)
      .pattern(/^[\p{L}\s]*$/u)
      .messages({
        "string.empty": "Full name is required",
        "string.min": "Full name must be at least 3 characters long",
        "string.max": "Full name cannot exceed 50 characters",
        "string.pattern.base": "Full name must contain only letters and spaces",
      }),
    username: Joi.string().required(),
    address: Joi.string().required(),
    dob: Joi.date().required().max("now").messages({
      "date.base": "Invalid date format",
      "date.max": "Date of birth cannot be in the future",
      "any.required": "Date of birth is required",
    }),
    gender: Joi.string().required(),
    role: Joi.optional().valid("member", "couple_therapist", "admin"),
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
  /**
   *         "fullname",
        "dob",
        "gender",
        "photoURL",
        "address",
   */
  body: Joi.object().keys({
    fullname: Joi.string()
      .required()
      .min(3)
      .max(50)
      .pattern(/^[\p{L}\s]*$/u)
      .messages({
        "string.empty": "Full name is required",
        "string.min": "Full name must be at least 3 characters long",
        "string.max": "Full name cannot exceed 50 characters",
        "string.pattern.base": "Full name must contain only letters and spaces",
      }),
    dob: Joi.date().required().max("now").messages({
      "date.base": "Invalid date format",
      "date.max": "Date of birth cannot be in the future",
      "any.required": "Date of birth is required",
    }),
    gender: Joi.string().valid("male", "female", "other"),
    address: Joi.string().min(5).max(100),
    photoURL: Joi.string().uri(),
  }),
};

module.exports = {
  getUserByIdValidation,
  createUserValidation,
  loginValidation,
  emailValidation,
  updateProfileValidation,
};
