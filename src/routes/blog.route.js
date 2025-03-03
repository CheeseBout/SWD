const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/create-post", auth, blogController.createPost);

/**
 * @swagger
 * /blog/{id}:
 *   put:
 *     summary: Update a blog post
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: object
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               coverPhotoUrl:
 *                 type: string
 *               postDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.put("/:id", auth, blogController.updatePost);

/**
 * @swagger
 * /blog/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.delete("/:id", auth, blogController.deletePost);

module.exports = router;
