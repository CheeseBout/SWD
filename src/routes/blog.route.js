const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");
const { auth } = require("../middlewares/auth.middleware");


router.get("/", blogController.getAllPosts);

router.get("/:slug", blogController.getPostBySlug);

router.post("/create-post", auth, blogController.createPost);

router.put("/:id", auth, blogController.updatePost);

router.delete("/:id", auth, blogController.deletePost);

module.exports = router;
