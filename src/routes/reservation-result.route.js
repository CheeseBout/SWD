const express = require("express");
const router = express.Router();
const reservationResultController = require("../controllers/reservationResult.controller");

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
 *         questions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *               content:
 *                 type: string
 *         answers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *               answer:
 *                 type: string
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
 *               - questions
 *               - answers
 *             properties:
 *               reservationID:
 *                 type: string
 *                 example: "65f2d6789abcdef01234567"
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     content:
 *                       type: string
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     answer:
 *                       type: string
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
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     content:
 *                       type: string
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     answer:
 *                       type: string
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

router.post(
  "/create-reservation-result",
  reservationResultController.createReservationResult
);
router.get(
  "/get-reservation-result/:reservationResultID",
  reservationResultController.getReservationResult
);
router.put(
  "/update-reservation-result/:reservationResultID",
  reservationResultController.updateReservationResult
);
router.put(
  "/delete-reservation-result/:reservationResultID",
  reservationResultController.deleteReservationResult
);
router.get(
  "/get-all-reservation-result",
  reservationResultController.getAllReservationResult
);

module.exports = router;
