const express = require("express");
const router = express.Router();
const reservationResultController = require("../controllers/reservationResult.controller");
const { auth } = require("../middlewares/auth.middleware");
const { route } = require("./reservation.route");

/**
 * @swagger
 * tags:
 *   name: Reservation Results
 *   description: Manage counseling session results
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ReservationResult:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         reservationID:
 *           type: string
 *           description: Reference to the reservation
 *         sessionSummary:
 *           type: string
 *           description: Summary of the counseling session
 *         issuesIdentified:
 *           type: array
 *           items:
 *             type: string
 *           description: List of issues identified during the session
 *         therapistRecommendations:
 *           type: string
 *           description: Recommendations provided by the therapist
 *         homeworkAssignment:
 *           type: string
 *           description: Homework assigned to the client
 *         status:
 *           type: string
 *           enum: [completed, deleted]
 *         deleteReason:
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
 * /reservation-result/create-reservation-result:
 *   post:
 *     summary: Create a new reservation result
 *     tags: [Reservation Results]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationID
 *               - sessionSummary
 *               - issuesIdentified
 *               - therapistRecommendations
 *               - homeworkAssignment
 *             properties:
 *               reservationID:
 *                 type: string
 *                 example: "65f2d6789abcdef01234567"
 *               sessionSummary:
 *                 type: string
 *                 example: "Detailed summary of the counseling session"
 *               issuesIdentified:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "Communication difficulties"
 *               therapistRecommendations:
 *                 type: string
 *                 example: "Weekly practice of active listening techniques"
 *               homeworkAssignment:
 *                 type: string
 *                 example: "Complete the communication exercise worksheet"
 *     responses:
 *       201:
 *         description: Reservation result created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationResult'
 *       400:
 *         description: Reservation not found or duplicate result
 */

/**
 * @swagger
 * /reservation-result/get-reservation-result/{reservationResultID}:
 *   get:
 *     summary: Get a reservation result by ID
 *     tags: [Reservation Results]
 *     parameters:
 *       - in: path
 *         name: reservationResultID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservation result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationResult'
 *       404:
 *         description: Reservation result not found
 */

/**
 * @swagger
 * /reservation-result/update-reservation-result/{reservationResultID}:
 *   put:
 *     summary: Update a reservation result
 *     tags: [Reservation Results]
 *     parameters:
 *       - in: path
 *         name: reservationResultID
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
 *               sessionSummary:
 *                 type: string
 *               issuesIdentified:
 *                 type: array
 *                 items:
 *                   type: string
 *               therapistRecommendations:
 *                 type: string
 *               homeworkAssignment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reservation result updated successfully
 *       404:
 *         description: Reservation result not found
 */

/**
 * @swagger
 * /reservation-result/delete-reservation-result/{reservationResultID}:
 *   put:
 *     summary: Soft delete a reservation result
 *     tags: [Reservation Results]
 *     parameters:
 *       - in: path
 *         name: reservationResultID
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
 *               - deleteReason
 *             properties:
 *               deleteReason:
 *                 type: string
 *                 example: "Session cancelled by therapist"
 *     responses:
 *       200:
 *         description: Reservation result deleted successfully
 *       400:
 *         description: Delete reason is required
 *       404:
 *         description: Reservation result not found
 */

/**
 * @swagger
 * /reservation-result/get-all-reservation-result:
 *   get:
 *     summary: Get all reservation results
 *     tags: [Reservation Results]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [completed, deleted]
 *         description: Filter by status
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
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of reservation results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReservationResult'
 */
/**
 * @swagger
 * /reservation-result/get-all-reservation-result/user/{userID}:
 *   get:
 *     summary: Get all reservation results for a user
 *     tags: [Reservation Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [completed, deleted]
 *         description: Filter results by status
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
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved reservation results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reservation results retrieved successfully
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ReservationResult'
 *                     total:
 *                       type: integer
 *                       example: 10
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pages:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Invalid user ID format
 *       403:
 *         description: Permission denied
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /reservation-result/get-all-reservation-result/therapist/{therapistID}:
 *   get:
 *     summary: Get all reservation results created by a therapist
 *     tags: [Reservation Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: therapistID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the therapist
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [completed, deleted]
 *         description: Filter results by status
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
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved reservation results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reservation results retrieved successfully
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ReservationResult'
 *                     total:
 *                       type: integer
 *                       example: 8
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pages:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid therapist ID format
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Therapist not found
 */
router.post(
  "/create-reservation-result",
  auth,
  reservationResultController.createReservationResult
);
router.get(
  "/get-reservation-result/:reservationResultID",
  reservationResultController.getReservationResult
);
router.put(
  "/update-reservation-result/:reservationResultID",
  auth,
  reservationResultController.updateReservationResult
);
router.put(
  "/delete-reservation-result/:reservationResultID",
  auth,
  reservationResultController.deleteReservationResult
);
router.get(
  "/get-all-reservation-result/user/:userID",
  auth,
  reservationResultController.getAllReservationResultByUser
);
router.get(
  "/get-all-reservation-result/therapist/:coupleTherapistID",
  auth,
  reservationResultController.getAllReservationResultByTherapist
);
module.exports = router;
