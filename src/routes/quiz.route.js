const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth.middleware");
const quizController = require("../controllers/quiz.controller");

/**
 * @swagger
 * tags:
 *   name: Quiz
 *   description: Quiz management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Quiz:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         quizName:
 *           type: string
 *         quizDescription:
 *           type: string
 *         imageUrl:
 *           type: string
 *         questions:
 *           type: array
 *           items:
 *             type: string
 *             description: Question ID reference
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *         lastEdited:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /quiz:
 *   get:
 *     summary: Get all quizzes
 *     tags: [Quiz]
 *     responses:
 *       200:
 *         description: List of all quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quizzes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Quiz'
 */
router.get("/", quizController.getAllQuizzes);

/**
 * @swagger
 * /quiz/{quizId}:
 *   get:
 *     summary: Get quiz by ID
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quiz:
 *                   $ref: '#/components/schemas/Quiz'
 *       404:
 *         description: Quiz not found
 *       400:
 *         description: Quiz is inactive
 */
router.get("/:quizId", quizController.getQuizById);

/**
 * @swagger
 * /quiz/create-quiz:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quizName
 *               - quizDescription
 *               - questions
 *               - topicID
 *             properties:
 *               quizName:
 *                 type: string
 *                 example: "Relationship Assessment Quiz"
 *               quizDescription:
 *                 type: string
 *                 example: "Evaluate your relationship readiness"
 *               questions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["65f2d6789abcdef01234567", "65f2d6789abcdef01234568"]
 *               imageUrl:
 *                 type: string
 *                 example: "https://example.com/quiz-image.jpg"
 *               topicID:
 *                 type: string
 *                 example: "65f2d6789abcdef01234569"
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 quiz:
 *                   $ref: '#/components/schemas/Quiz'
 *       403:
 *         description: Only admin and couple therapist can create quiz
 */
router.post("/create-quiz", auth, quizController.createQuiz);

/**
 * @swagger
 * /quiz/update-quiz/{quizId}:
 *   put:
 *     summary: Update a quiz
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
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
 *               quizName:
 *                 type: string
 *               quizDescription:
 *                 type: string
 *               questionID:
 *                 type: string
 *                 description: ID of new question to add
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 quiz:
 *                   $ref: '#/components/schemas/Quiz'
 *       400:
 *         description: Question already exists in quiz
 *       403:
 *         description: Only admin and couple therapist can update quiz
 *       404:
 *         description: Quiz not found
 */
router.put("/update-quiz/:quizId", auth, quizController.updateQuiz);

/**
 * @swagger
 * /quiz/delete-quiz/{quizId}:
 *   put:
 *     summary: Soft delete a quiz
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
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
 *               deletedReason:
 *                 type: string
 *                 example: "Quiz content outdated"
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 quiz:
 *                   $ref: '#/components/schemas/Quiz'
 *       403:
 *         description: Only admin and couple therapist can delete quiz
 *       404:
 *         description: Quiz not found
 */
router.put("/delete-quiz/:quizId", auth, quizController.deleteQuiz);

module.exports = router;
