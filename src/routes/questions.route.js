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
 *         content:
 *           type: string
 *         questionBank:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Option'
 *         status:
 *           type: string
 *           enum: [active, inactive]
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
 *         questions:
 *           type: array
 *           items:
 *             type: string
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
 *         description: Success
 *         content: {"application/json":{"schema":{"type":"object","properties":{"data":{"type":"array","items":{"$ref":"#/components/schemas/Question"}}}}}}
 */
router.get("/", questionsController.getAllQuestions);

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
 *         description: Success
 *         content: {"application/json":{"schema":{"type":"object","properties":{"data":{"$ref":"#/components/schemas/Question"}}}}}
 *       404:
 *         description: Question not found
 */
router.get("/:questionId", questionsController.getQuestionById);

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
 *       content: {"application/json":{"schema":{"type":"object","required":["questionContent","questionBank"],"properties":{"questionContent":{"type":"string"},"questionBank":{"type":"string"}}}}}
 *     responses:
 *       201:
 *         description: Question created successfully
 *         content: {"application/json":{"schema":{"type":"object","properties":{"data":{"$ref":"#/components/schemas/Question"}}}}}
 *       403:
 *         description: Only admin and couple therapist can create questions
 */
router.post("/create-question", auth, questionsController.createQuestion);

/**
 * @swagger
 * /questions/create-question-bank:
 *   post:
 *     summary: Create a question bank
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content: {"application/json":{"schema":{"type":"object","required":["questionBankName","description","topic"],"properties":{"questionBankName":{"type":"string"},"description":{"type":"string"},"topic":{"type":"string"}}}}}
 *     responses:
 *       201:
 *         description: Question bank created successfully
 *         content: {"application/json":{"schema":{"type":"object","properties":{"data":{"type":"object","properties":{"questionBank":{"$ref":"#/components/schemas/QuestionBank"}}}}}}}
 */
router.post(
  "/create-question-bank",
  auth,
  questionsController.createQuestionsBank
);

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
 *       content: {"application/json":{"schema":{"type":"object","required":["questionContent"],"properties":{"questionContent":{"type":"string"}}}}}
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       403:
 *         description: Only admin and couple therapist can update questions
 *       404:
 *         description: Question not found
 */
router.put(
  "/update-question/:questionId",
  auth,
  questionsController.updateQuestion
);

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
 *       content: {"application/json":{"schema":{"type":"object","properties":{"questionBankName":{"type":"string"},"description":{"type":"string"}}}}}
 *     responses:
 *       200:
 *         description: Question bank updated successfully
 *       403:
 *         description: Only admin and couple therapist can update question banks
 */
router.put(
  "/update-question-bank/:questionBankId",
  auth,
  questionsController.updateQuestionsBank
);

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
router.put(
  "/delete-question/:questionId",
  auth,
  questionsController.deleteQuestion
);

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
router.put(
  "/delete-question-bank/:questionBankId",
  auth,
  questionsController.deleteQuestionsBank
);

module.exports = router;
