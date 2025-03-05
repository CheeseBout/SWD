const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservation.controller");
const { auth } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Counseling session reservation management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Reservation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *           description: ID of user making the reservation
 *         coupleTherapistID:
 *           type: string
 *           description: ID of the therapist
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [pending, approved, denied, cancelled]
 *         deniedReason:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /reservation/create-reservation:
 *   post:
 *     summary: Create a new reservation
 *     tags: [Reservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - coupleTherapistID
 *               - startTime
 *               - endTime
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "65f2d6789abcdef01234567"
 *               coupleTherapistID:
 *                 type: string
 *                 example: "65f2d6789abcdef01234568"
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-03-15T09:00:00Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-03-15T10:00:00Z"
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Duplicate reservation or therapist not available
 */

/**
 * @swagger
 * /reservation/get-all-reservation:
 *   get:
 *     summary: Get all reservations
 *     tags: [Reservations]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, denied, cancelled]
 *       - in: query
 *         name: therapistId
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 */

/**
 * @swagger
 * /reservation/get-reservation/{reservationID}:
 *   get:
 *     summary: Get reservation by ID
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: reservationID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservation details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Reservation not found
 */

/**
 * @swagger
 * /reservation/update-reservation/{reservationID}:
 *   put:
 *     summary: Update a reservation
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: reservationID
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
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               coupleTherapistID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reservation updated successfully
 *       400:
 *         description: Duplicate reservation or invalid input
 *       404:
 *         description: Reservation not found
 */

/**
 * @swagger
 * /reservation/approve-reservation/{reservationID}:
 *   put:
 *     summary: Approve a reservation
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: reservationID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservation approved successfully
 *       404:
 *         description: Reservation not found
 */

/**
 * @swagger
 * /reservation/deny-reservation/{reservationID}:
 *   put:
 *     summary: Deny a reservation
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: reservationID
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Therapist unavailable due to emergency"
 *     responses:
 *       200:
 *         description: Reservation denied successfully
 *       400:
 *         description: Reason is required
 *       404:
 *         description: Reservation not found
 */

/**
 * @swagger
 * /reservation/delete-reservation/{reservationID}:
 *   put:
 *     summary: Cancel a reservation
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: reservationID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully
 *       404:
 *         description: Reservation not found
 */

router.post("/create-reservation", auth, reservationController.createReservation);
router.get("/get-all-reservation", reservationController.getAllReservation);
router.get(
  "/get-reservation/:reservationID",
  reservationController.getReservationById
);
router.put(
  "/update-reservation/:reservationID",
  auth,
  reservationController.updateReservation
);
router.put(
  "/delete-reservation/:reservationID",
  auth,
  reservationController.deleteReservation
);
router.put(
  "/approve-reservation/:reservationID",
  auth,
  reservationController.approveReservation
);
router.put(
  "/deny-reservation/:reservationID",
  auth,
  reservationController.denyReservation
);

module.exports = router;
