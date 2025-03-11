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
 *         userID:
 *           type: string
 *           description: ID of user making the reservation
 *         coupleTherapistID:
 *           type: string
 *           description: ID of the therapist
 *         title:
 *           type: string
 *           description: Title of the reservation
 *         content:
 *           type: string
 *           description: Content of the reservation
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [pending, confirmed, completed, canceled, denied]
 *         deniedReason:
 *           type: string
 *           nullable: true
 *         totalPrice:
 *           type: number
 *           description: Price in VND
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PaymentResponse:
 *       type: object
 *       properties:
 *         paymentUrl:
 *           type: string
 *           description: URL for payment processing
 *           example: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
 *         transaction:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             payment:
 *               type: string
 *             phase:
 *               type: string
 *               enum: [DEPOSIT]
 *             amount:
 *               type: number
 *             method:
 *               type: string
 *               enum: [VNPAY]
 *             transactionCode:
 *               type: string
 *             status:
 *               type: string
 *               enum: [PENDING]
 *             createdAt:
 *               type: string
 *               format: date-time
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /reservation/create-reservation:
 *   post:
 *     summary: Create a new reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coupleTherapistID
 *               - title
 *               - content
 *               - startTime
 *               - endTime
 *             properties:
 *               coupleTherapistID:
 *                 type: string
 *                 example: "65f2d6789abcdef01234568"
 *               title:
 *                 type: string
 *                 example: "Marriage Counseling Session"
 *               content:
 *                 type: string
 *                 example: "Need guidance on communication issues in our marriage"
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
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Reservation created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Duplicate reservation or therapist not available
 *       401:
 *         description: Unauthorized - Missing or invalid token
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
 *           enum: [pending, confirmed, completed, canceled, denied]
 *         description: Filter by reservation status
 *       - in: query
 *         name: therapistId
 *         schema:
 *           type: string
 *         description: Filter by therapist ID
 *       - in: query
 *         name: userID
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Reservations retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */

/**
 * @swagger
 * /reservation/get-all-reservation/{userID}:
 *   get:
 *     summary: Get all reservations for a specific user
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, canceled, denied]
 *         description: Filter by reservation status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of user's reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "User reservations retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - You can only access your own reservations
 *       404:
 *         description: User not found
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
 *         description: The reservation ID
 *     responses:
 *       200:
 *         description: Reservation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Reservation retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Reservation not found
 */

/**
 * @swagger
 * /reservation/update-reservation/{reservationID}:
 *   put:
 *     summary: Update a reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationID
 *         required: true
 *         schema:
 *           type: string
 *         description: The reservation ID to update
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
 *                 example: "2024-03-20T09:00:00Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-03-20T10:00:00Z"
 *               coupleTherapistID:
 *                 type: string
 *                 example: "65f2d6789abcdef01234569"
 *               title:
 *                 type: string
 *                 example: "Updated Counseling Session"
 *               content:
 *                 type: string
 *                 example: "Updated details about our issues"
 *     responses:
 *       200:
 *         description: Reservation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Reservation updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Invalid input data or therapist not available
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - You can only update your own reservations
 *       404:
 *         description: Reservation not found
 */

/**
 * @swagger
 * /reservation/approve-reservation/{reservationID}:
 *   put:
 *     summary: Approve a reservation (Therapist only)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationID
 *         required: true
 *         schema:
 *           type: string
 *         description: The reservation ID to approve
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *                 example: 690000
 *                 description: Price in VND
 *     responses:
 *       200:
 *         description: Reservation approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Reservation approved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Only therapists can approve reservations
 *       404:
 *         description: Reservation not found
 */

/**
 * @swagger
 * /reservation/deny-reservation/{reservationID}:
 *   put:
 *     summary: Deny a reservation (Therapist only)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationID
 *         required: true
 *         schema:
 *           type: string
 *         description: The reservation ID to deny
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
 *                 example: "Therapist unavailable due to scheduling conflict"
 *                 description: Reason for denying the reservation
 *     responses:
 *       200:
 *         description: Reservation denied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Reservation denied successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Reason is required
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Only therapists can deny reservations
 *       404:
 *         description: Reservation not found
 */

/**
 * @swagger
 * /reservation/delete-reservation/{reservationID}:
 *   put:
 *     summary: Cancel a reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationID
 *         required: true
 *         schema:
 *           type: string
 *         description: The reservation ID to cancel
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Reservation cancelled successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - You can only cancel your own reservations
 *       404:
 *         description: Reservation not found
 */

router.post(
  "/create-reservation",
  auth,
  reservationController.createReservation
);
router.get("/get-all-reservation", reservationController.getAllReservation);
router.get(
  "/get-reservation/:reservationID",
  reservationController.getReservationById
);
router.get(
  "/get-all-reservation/:userID",
  auth,
  reservationController.getReservationsByUser
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
