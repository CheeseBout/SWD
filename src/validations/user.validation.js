const Joi = require("joi");
const getUserByIdValidation = {
  params: Joi.object().keys({
    id: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message("Invalid id"),
  }),
};

const createUserValidation = {
  params: Joi.object().keys({
    password: Joi.string()
      .required()
      .min(8)
      .uppercase()
      .lowercase()
      .numeric()
      .symbol()
      .message(
        "Password must be at least 8 characters, including uppercase, lowercase, number and symbol"
      ),
    email: Joi.string()
      .required()
      .pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
      .message("Email must be a valid Gmail address"),
    name: Joi.string().required(),
  }),
};

module.exports = { getUserByIdValidation, createUserValidation };
