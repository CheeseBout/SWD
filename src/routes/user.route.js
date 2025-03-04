const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const validate = require("../middlewares/validate.middleware");
const {
  getUserByIdValidation,
  updateProfileValidation,
} = require("../validations/user.validation");
const { auth } = require("../middlewares/auth.middleware");
const {
  updateExpertProfileValidation,
} = require("../validations/auth.validation");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
  // auth,
  userController.getUserById
);
router.put(
  "/update-profile",
  auth,
  validate(updateProfileValidation),
  userController.updateProfile
);

router.patch(
  "/change-avatar",
  auth,
  upload.single("image"),
  userController.changeAvatar
);

module.exports = router;
