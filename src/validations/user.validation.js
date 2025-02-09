const Joi = require("joi");
const getUserByIdValidation = {
  params: Joi.object().keys({
    id: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message("Invalid id"),
  }),
};

module.exports = { getUserByIdValidation };
