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
 * /quiz/get-quiz:
 *   get:
 *     summary: Get quiz by ID
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quizId
 *             properties:
 *               quizId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Quiz details
 */
router.get("/get-quiz", quizController.getQuizById);

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
 * /quiz/update-quiz:
 *   put:
 *     summary: Update a quiz
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
 *               - quizId
 *             properties:
 *               quizId:
 *                 type: string
 *               quizName:
 *                 type: string
 *               quizDescription:
 *                 type: string
 *               questionID:
 *                 type: string
 */
router.put("/update-quiz", auth, quizController.updateQuiz);

/**
 * @swagger
 * /quiz/delete-quiz:
 *   put:
 *     summary: Soft delete a quiz
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
 *               - quizId
 *             properties:
 *               quizId:
 *                 type: string
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
router.put("/delete-quiz", auth, quizController.deleteQuiz);

/**
 * @swagger
 * /quiz/activate-quiz:
 *   put:
 *     summary: Activate a quiz
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
 *               - quizId
 *             properties:
 *               quizId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Quiz activated successfully
 *       403:
 *         description: Only admin and couple therapist can activate quiz
 */
router.put("/activate-quiz", auth, quizController.activateQuiz);

module.exports = router;