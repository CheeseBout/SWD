const express = require("express");
const router = express.Router();
const { getUserByIdValidation } = require("../validations/user.validation");
const { auth } = require("../middlewares/auth.middleware");
const optionsController = require("../controllers/options.controller");

/**
 * @swagger
 * tags:
 *   name: Options
 *   description: Question options management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Option:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         questionID:
 *           type: string
 *         options:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               optionContent:
 *                 type: string
 *               score:
 *                 type: number
 *               _id:
 *                 type: string
 *         lastEdited:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /options:
 *   get:
 *     summary: Get all options
 *     tags: [Options]
 *     responses:
 *       200:
 *         description: List of all options
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 options:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Option'
 */

/**
 * @swagger
 * /options/{id}:
 *   get:
 *     summary: Get option by ID
 *     tags: [Options]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Option details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 option:
 *                   $ref: '#/components/schemas/Option'
 *       404:
 *         description: Option not found
 */

/**
 * @swagger
 * /options/create-option:
 *   post:
 *     summary: Create new options for a question
 *     tags: [Options]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionID
 *               - options
 *             properties:
 *               questionID:
 *                 type: string
 *                 example: "67c09f9c52bf9efae356653f"
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - optionContent
 *                     - score
 *                   properties:
 *                     optionContent:
 *                       type: string
 *                     score:
 *                       type: number
 *                 example: [
 *                   { "optionContent": "1-2 years", "score": 1 },
 *                   { "optionContent": "3-4 years", "score": 2 },
 *                   { "optionContent": "6-7 years", "score": 3 },
 *                   { "optionContent": "10-12 years", "score": 4 }
 *                 ]
 *     responses:
 *       201:
 *         description: Options created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         content:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               optionContent:
 *                                 type: string
 *                               score:
 *                                 type: number
 *                               _id:
 *                                 type: string
 *                         lastEdited:
 *                           type: string
 *                           format: date-time
 *                     options:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         questionID:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               optionContent:
 *                                 type: string
 *                               score:
 *                                 type: number
 *                               _id:
 *                                 type: string
 *       400:
 *         description: Question already has maximum options or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Question already has 4 options"
 *       403:
 *         description: Only admin and couple therapist can add options
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Only admin and couple therapist can add options"
 *       404:
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Question not found"
 */

/**
 * @swagger
 * /options/update:
 *   put:
 *     summary: Update an option
 *     tags: [Options]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - optionID
 *               - questionID
 *             properties:
 *               optionID:
 *                 type: string
 *               questionID:
 *                 type: string
 *               optionContent:
 *                 type: string
 *               score:
 *                 type: number
 *     responses:
 *       200:
 *         description: Option updated successfully
 *       403:
 *         description: Only admin and couple therapist can update options
 *       404:
 *         description: Option not found
 */

/**
 * @swagger
 * /options/delete:
 *   delete:
 *     summary: Delete an option
 *     tags: [Options]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - optionID
 *               - questionID
 *             properties:
 *               optionID:
 *                 type: string
 *               questionID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Option deleted successfully
 *       403:
 *         description: Only admin and couple therapist can delete options
 *       404:
 *         description: Option not found
 */

/**
 * @swagger
 * /options/select:
 *   post:
 *     summary: Select options for questions
 *     tags: [Options]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   optionID:
 *                     type: string
 *                   questionID:
 *                     type: string
 *               - type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     optionID:
 *                       type: string
 *                     questionID:
 *                       type: string
 *     responses:
 *       200:
 *         description: Options selected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       optionID:
 *                         type: string
 *                       questionID:
 *                         type: string
 *                       score:
 *                         type: number
 *                       optionContent:
 *                         type: string
 *                       selectedAt:
 *                         type: string
 *                         format: date-time
 *                       userAnswerId:
 *                         type: string
 *                 totalScore:
 *                   type: number
 */

//Public Routes
router.get("/", optionsController.getAllOptions);

router.get("/:id", optionsController.getOptionById);
//Protected Routes

router.post("/create-option", auth, optionsController.createOption);
router.post("/select-option", auth, optionsController.selectOption);

router.put("/update-option", auth, optionsController.updateOption);

router.put("/delete-option", auth, optionsController.deleteOption);

module.exports = router;
