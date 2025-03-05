const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");
const { auth } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BlogContent:
 *       type: object
 *       properties:
 *         children:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [paragraph, heading]
 *               attrs:
 *                 type: object
 *                 properties:
 *                   level:
 *                     type: number
 *               children:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *     Blog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         category:
 *           type: string
 *         authorName:
 *           type: string
 *         description:
 *           type: string
 *         coverPhotoUrl:
 *           type: string
 *         postDate:
 *           type: string
 *           format: date-time
 *         content:
 *           $ref: '#/components/schemas/BlogContent'
 */

/**
 * @swagger
 * /blog:
 *   get:
 *     summary: Get all blog posts
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *     responses:
 *       200:
 *         description: List of blog posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 */
router.get("/", blogController.getAllPosts);

/**
 * @swagger
 * /blog/{slug}:
 *   get:
 *     summary: Get blog post by slug
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog post slug
 *     responses:
 *       200:
 *         description: Blog post found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog post not found
 */
router.get("/:slug", blogController.getPostBySlug);

/**
 * @swagger
 * /blog/create-post:
 *   post:
 *     summary: Create new blog post
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - authorName
 *               - description
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Bí quyết giữ lửa hôn nhân bền vững"
 *               category:
 *                 type: string
 *                 example: "Hôn nhân & Gia đình"
 *               authorName:
 *                 type: string
 *                 example: "Nguyên Vũ"
 *               description:
 *                 type: string
 *                 example: "test"
 *               coverPhotoUrl:
 *                 type: string
 *                 example: "https://example.com/images/marriage-tips-cover.jpg"
 *               postDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-02-28T13:50:53.053Z"
 *               content:
 *                 $ref: '#/components/schemas/BlogContent'
 *     responses:
 *       201:
 *         description: Blog post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input data
 */
router.post("/create-post", auth, blogController.createPost);

/**
 * @swagger
 * /blog/{id}:
 *   put:
 *     summary: Update blog post
 *     tags: [Blogs]
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
 *                 example: "Bí quyết giữ lửa hôn nhân bền vững"
 *               category:
 *                 type: string
 *                 example: "Hôn nhân & Gia đình"
 *               description:
 *                 type: string
 *               coverPhotoUrl:
 *                 type: string
 *               postDate:
 *                 type: string
 *                 format: date-time
 *               content:
 *                 $ref: '#/components/schemas/BlogContent'
 *     responses:
 *       200:
 *         description: Blog post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog post not found
 *   delete:
 *     summary: Delete blog post
 *     tags: [Blogs]
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
 *         description: Blog post deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog post not found
 */
router.put("/:id", auth, blogController.updatePost);
router.delete("/:id", auth, blogController.deletePost);

module.exports = router;
