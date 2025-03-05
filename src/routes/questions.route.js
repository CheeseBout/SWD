const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth.middleware");
const questionsController = require("../controllers/questions.controller");

/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: Question and question bank management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         questionContent:
 *           type: string
 *         questionBank:
 *           type: string
 *           description: Reference to question bank ID
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *         options:
 *           type: array
 *           items:
 *             type: string
 *             description: Reference to option IDs
 *     QuestionBank:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         questionBankName:
 *           type: string
 *         description:
 *           type: string
 *         topic:
 *           type: string
 *           description: Reference to topic ID
 *         questions:
 *           type: array
 *           items:
 *             type: string
 *             description: Reference to question IDs
 *         status:
 *           type: string
 *           enum: [active, inactive]
 */

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get all questions
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: List of all questions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Question'
 */

/**
 * @swagger
 * /questions/{questionId}:
 *   get:
 *     summary: Get question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Question'
 *       404:
 *         description: Question not found
 */

/**
 * @swagger
 * /questions/create-question:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionContent
 *               - questionBank
 *             properties:
 *               questionContent:
 *                 type: string
 *                 example: "How long have you been in your current relationship?"
 *               questionBank:
 *                 type: string
 *                 example: "65f2d6789abcdef01234567"
 *     responses:
 *       201:
 *         description: Question created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Question'
 *                 questionBank:
 *                   $ref: '#/components/schemas/QuestionBank'
 *       403:
 *         description: Only admin and couple therapist can create questions
 */

/**
 * @swagger
 * /questions/create-question-bank:
 *   post:
 *     summary: Create a new question bank
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json
 *           schema:
 *             type: object
 *             required:
 *               - questionBankName
 *               - description
 *               - topic
 *             properties:
 *               questionBankName:
 *                 type: string
 *                 example: "Relationship History"
 *               description:
 *                 type: string
 *                 example: "Questions about past relationships and experiences"
 *               topic:
 *                 type: string
 *                 example: "65f2d6789abcdef01234567"
 *               topicName:
 *                 type: string
 *                 example: "Relationship Assessment"
 *               topicDescription:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Question bank created successfully
 *       403:
 *         description: Only admin and couple therapist can create question banks
 */

/**
 * @swagger
 * /questions/update-question/{questionId}:
 *   put:
 *     summary: Update a question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json
 *           schema:
 *             type: object
 *             required:
 *               - questionContent
 *             properties:
 *               questionContent:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       403:
 *         description: Only admin and couple therapist can update questions
 *       404:
 *         description: Question not found
 */

/**
 * @swagger
 * /questions/update-question-bank/{questionBankId}:
 *   put:
 *     summary: Update a question bank
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionBankId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json
 *           schema:
 *             type: object
 *             properties:
 *               questionBankName:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question bank updated successfully
 *       403:
 *         description: Only admin and couple therapist can update question banks
 */

/**
 * @swagger
 * /questions/delete-question/{questionId}:
 *   put:
 *     summary: Soft delete a question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       403:
 *         description: Only admin and couple therapist can delete questions
 */

/**
 * @swagger
 * /questions/delete-question-bank/{questionBankId}:
 *   put:
 *     summary: Soft delete a question bank
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionBankId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question bank deleted successfully
 *       403:
 *         description: Only admin and couple therapist can delete question banks
 */

//Public Routes
router.get("/", questionsController.getAllQuestions);

router.get("/:questionId", questionsController.getQuestionById);
//Protected Routes

//Questions
router.post("/create-question", auth, questionsController.createQuestion);

router.put(
  "/update-question/:questionId",
  auth,
  questionsController.updateQuestion
);

router.put(
  "/delete-question/:questionId",
  auth,
  questionsController.deleteQuestion
);

//Question Banks
router.post(
  "/create-question-bank",
  auth,
  questionsController.createQuestionsBank
);

router.put(
  "/update-question-bank/:questionBankId",
  auth,
  questionsController.updateQuestionsBank
);

router.put(
  "/delete-question-bank/:questionBankId",
  auth,
  questionsController.deleteQuestionsBank
);
module.exports = router;
