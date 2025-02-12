const express = require("express");
const router = express.Router();
const { getUserByIdValidation } = require("../validations/user.validation");
const auth = require("../middlewares/auth.middleware");
const optionsController = require("../controllers/options.controller");

//Public Routes
router.get("/", optionsController.getAllOptions);

router.get("/:id", optionsController.getOptionById);
//Protected Routes

router.post("/create-option", auth, optionsController.createOption);
router.post("/select-option", auth, optionsController.selectOption);

router.put("/update-option", auth, optionsController.updateOption);

router.put("/delete-option", auth, optionsController.deleteOption);

module.exports = router;
