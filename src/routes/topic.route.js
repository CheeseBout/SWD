const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate.middleware");
const { getUserByIdValidation } = require("../validations/user.validation");
const { auth } = require("../middlewares/auth.middleware");
const topicController = require("../controllers/topic.controller");

/**
 * @swagger
 * tags:
 *   name: Topics
 *   description: Topic management for counseling content
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Topic:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         imageUrl:
 *           type: string
 *         quizzes:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *         deletedReason:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /topics:
 *   get:
 *     summary: Get all topics
 *     tags: [Topics]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by topic name
 *     responses:
 *       200:
 *         description: List of topics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topics:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Topic'
 */
router.get("/", topicController.getAllTopics);

/**
 * @swagger
 * /topics/{topicId}:
 *   get:
 *     summary: Get topic by ID
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Topic details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topic:
 *                   $ref: '#/components/schemas/Topic'
 *       404:
 *         description: Topic not found
 */
router.get("/:topicId", topicController.getTopicById);

/**
 * @swagger
 * /topics/create-topic:
 *   post:
 *     summary: Create a new topic
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Marriage Communication"
 *               description:
 *                 type: string
 *                 example: "Effective communication strategies for couples"
 *               imageUrl:
 *                 type: string
 *                 example: "https://example.com/images/communication.jpg"
 *     responses:
 *       201:
 *         description: Topic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Topic'
 *       403:
 *         description: Only admin and couple therapist can create topics
 */
router.post("/create-topic", auth, topicController.createTopic);

/**
 * @swagger
 * /topics/update-topic/{topicId}:
 *   put:
 *     summary: Update a topic
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Topic updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updatedTopic:
 *                   $ref: '#/components/schemas/Topic'
 *       403:
 *         description: Only admin and couple therapist can update topics
 *       404:
 *         description: Topic not found
 */
router.put("/update-topic/:topicId", auth, topicController.updateTopic);

/**
 * @swagger
 * /topics/delete-topic/{topicId}:
 *   put:
 *     summary: Soft delete a topic
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deletedReason
 *             properties:
 *               deletedReason:
 *                 type: string
 *                 example: "Content outdated"
 *     responses:
 *       200:
 *         description: Topic deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Topic'
 *       403:
 *         description: Only admin and couple therapist can delete topics
 *       404:
 *         description: Topic not found
 */
router.put("/delete-topic/:topicId", auth, topicController.deleteTopic);

module.exports = router;
