const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const validate = require("../middlewares/validate.middleware");
const { getUserByIdValidation } = require("../validations/user.validation");
const auth = require("../middlewares/auth.middleware");

//Public Routes
router.get("/", userController.getAllUser);

//Protected Routes
router.get(
  "/my-profile",
  auth,
  validate(getUserByIdValidation),
  userController.getUserById
);
router.get(
  "/:id",
  validate(getUserByIdValidation),
  auth,
  userController.getUserById
);
router.post("/update-profile", auth, userController.updateProfile);

module.exports = router;
