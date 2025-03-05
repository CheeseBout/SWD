const express = require("express");
const meetController = require("../controllers/meet.controller");
const { auth } = require("../middlewares/auth.middleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Google Meet
 *   description: Google Meet integration endpoints
 */

/**
 * @swagger
 * /google-meet/create-meet:
 *   post:
 *     summary: Create a new Google Meet meeting
 *     tags: [Google Meet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startTime
 *               - endTime
 *               - email
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-02-21T09:00:00"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-02-21T10:00:00"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "narutogaming4675@gmail.com"
 *     responses:
 *       201:
 *         description: Meeting created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 meetLink:
 *                   type: string
 *                   example: "https://meet.google.com/abc-defg-hij"
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-02-21T09:00:00"
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-02-21T10:00:00"
 *                 eventId:
 *                   type: string
 *                   example: "abc123def456"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       400:
 *         description: Invalid input - Missing required fields or invalid date format
 *       500:
 *         description: Google Calendar API error
 */
router.post("/create-meet", auth, meetController.createMeeting);

module.exports = router;
