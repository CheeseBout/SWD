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
    fullname: Joi.string()
      .required()
      .min(3)
      .max(50)
      .pattern(/^[a-zA-Z\s]*$/)
      .messages({
        "string.empty": "Full name is required",
        "string.min": "Full name must be at least 3 characters long",
        "string.max": "Full name cannot exceed 50 characters",
        "string.pattern.base": "Full name must contain only letters and spaces",
      }),
    username: Joi.string().required(),
    address: Joi.string().required(),
    dob: Joi.string()
      .required()
      .pattern(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/)
      .custom((value, helpers) => {
        const [day, month, year] = value.split("/");
        const date = new Date(year, month - 1, day);

        // Check if date is valid and not in future
        if (isNaN(date.getTime())) {
          return helpers.error("date.invalid");
        }
        if (date > new Date()) {
          return helpers.error("date.future");
        }
        return value;
      })
      .messages({
        "string.pattern.base": "Date must be in DD/MM/YYYY format",
        "date.invalid": "Invalid date",
        "date.future": "Date of birth cannot be in the future",
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
      .pattern(/^[a-zA-Z\s]*$/)
      .messages({
        "string.empty": "Full name is required",
        "string.min": "Full name must be at least 3 characters long",
        "string.max": "Full name cannot exceed 50 characters",
        "string.pattern.base": "Full name must contain only letters and spaces",
      }),
    dob: Joi.string()
      .pattern(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/)
      .custom((value, helpers) => {
        const [day, month, year] = value.split("/");
        const date = new Date(year, month - 1, day);

        // Check if date is valid and not in future
        if (isNaN(date.getTime())) {
          return helpers.error("date.invalid");
        }
        if (date > new Date()) {
          return helpers.error("date.future");
        }
        return value;
      })
      .messages({
        "string.pattern.base": "Date must be in DD/MM/YYYY format",
        "date.invalid": "Invalid date",
        "date.future": "Date of birth cannot be in the future",
      }),
    gender: Joi.string().valid("Male", "Female", "Other"),
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
