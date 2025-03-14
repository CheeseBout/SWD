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
 * /questions/get-all-question-banks:
 *   get:
 *     summary: Get all question banks
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QuestionBank'
 */
router.get("/get-all-question-banks", questionsController.getAllQuestionsBank);

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
 * /questions/activate-question:
 *   put:
 *     summary: Activate a question
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
 *               - questionId
 *             properties:
 *               questionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question activated successfully
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
 *                   $ref: '#/components/schemas/Question'
 */
router.put("/activate-question", auth, questionsController.activateQuestion);

/**
 * @swagger
 * /questions/activate-question-bank:
 *   put:
 *     summary: Activate a question bank
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
 *               - questionBankId
 *             properties:
 *               questionBankId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question bank activated successfully
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
 *                   $ref: '#/components/schemas/QuestionBank'
 */
router.put(
  "/activate-question-bank",
  auth,
  questionsController.activateQuestionBank
);

/**
 * @swagger
 * /questions/get-question:
 *   get:
 *     summary: Get question by ID
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *             properties:
 *               questionId:
 *                 type: string
 */
router.get("/get-question", questionsController.getQuestionById);

/**
 * @swagger
 * /questions/update-question:
 *   put:
 *     summary: Update a question
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
 *               - questionId
 *               - questionContent
 *             properties:
 *               questionId:
 *                 type: string
 *               questionContent:
 *                 type: string
 */
router.put("/update-question", auth, questionsController.updateQuestion);

/**
 * @swagger
 * /questions/update-question-bank:
 *   put:
 *     summary: Update a question bank
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
 *               - questionBankId
 *             properties:
 *               questionBankId:
 *                 type: string
 *               questionBankName:
 *                 type: string
 *               description:
 *                 type: string
 */
router.put(
  "/update-question-bank",
  auth,
  questionsController.updateQuestionsBank
);

/**
 * @swagger
 * /questions/delete-question:
 *   put:
 *     summary: Soft delete a question
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
 *               - questionId
 *             properties:
 *               questionId:
 *                 type: string
 */
router.put("/delete-question", auth, questionsController.deleteQuestion);

/**
 * @swagger
 * /questions/delete-question-bank:
 *   put:
 *     summary: Soft delete a question bank
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
 *               - questionBankId
 *             properties:
 *               questionBankId:
 *                 type: string
 */
router.put(
  "/delete-question-bank",
  auth,
  questionsController.deleteQuestionsBank
);

module.exports = router;
