const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { auth } = require("../middlewares/auth.middleware");

router.get("/", categoryController.getAllCategories);
router.get("/id/:id", categoryController.getCategoryById);
router.get("/name", categoryController.getCategoryByName);
router.get("/status", categoryController.getCategoryByStatus);

router.post("/create", auth, categoryController.createCategory);
router.put("/", auth, categoryController.updateCategory);
router.delete("/", auth, categoryController.deleteCategory);

module.exports = router;
