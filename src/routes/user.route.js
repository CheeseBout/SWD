const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const validate = require("../middlewares/validate.middleware");
const { getUserByIdValidation } = require("../validations/user.validation");
router.get(
  "/my-profile",
  validate(getUserByIdValidation),
  userController.getUserById
);
router.get("/", userController.getAllUser);
router.get("/:id", validate(getUserByIdValidation), userController.getUserById);

module.exports = router;
