const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");

router.post("/create-post", blogController.createPost);

module.exports = router;
