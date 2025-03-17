const express = require("express");
const router = express.Router();
const reservationResultController = require("../controllers/reservationResult.controller");
const { auth } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Reservation Results
 *   description: Manage counseling session results and therapy documentation
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
 *           description: Unique identifier for the reservation result
 *         reservationID:
 *           type: string
 *           description: Reference to the related reservation
 *         sessionSummary:
 *           type: string
 *           description: Detailed summary of the counseling session
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
 *           description: Homework assigned to the couple
 *         status:
 *           type: string
 *           enum: [completed, deleted]
 *           description: Status of the reservation result
 *         deleteReason:
 *           type: string
 *           nullable: true
 *           description: Reason for deletion if status is 'deleted'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the result was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the result was last updated
 *     ReservationResultResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Success"
 *         status:
 *           type: integer
 *           example: 200
 *         data:
 *           $ref: '#/components/schemas/ReservationResult'
 *     PaginatedResultsResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Success"
 *         status:
 *           type: integer
 *           example: 200
 *         data:
 *           type: object
 *           properties:
 *             results:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReservationResult'
 *             total:
 *               type: integer
 *               example: 10
 *             page:
 *               type: integer
 *               example: 1
 *             pages:
 *               type: integer
 *               example: 2
 */

/**
 * @swagger
 * /reservation-result/create-reservation-result:
 *   post:
 *     summary: Create a new reservation result (Therapist only)
 *     description: Creates a therapy session report for a completed session. Only accessible by the therapist who conducted the session.
 *     tags: [Reservation Results]
 *     security:
 *       - bearerAuth: []
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
 *                 description: ID of the completed reservation
 *                 example: "65f2d6789abcdef01234567"
 *               sessionSummary:
 *                 type: string
 *                 description: Comprehensive summary of the counseling session
 *                 example: "The couple discussed communication challenges they've been experiencing over the past year. Partner A expressed feeling unheard during disagreements, while Partner B described feeling overwhelmed by emotional conversations."
 *               issuesIdentified:
 *                 type: array
 *                 description: Specific issues identified during the session
 *                 items:
 *                   type: string
 *                 example: ["Communication barriers", "Conflict resolution", "Emotional regulation"]
 *               therapistRecommendations:
 *                 type: string
 *                 description: Professional recommendations from the therapist
 *                 example: "I recommend implementing the 'speaker-listener' technique during disagreements. The couple would benefit from weekly check-ins using the communication framework we discussed in session."
 *               homeworkAssignment:
 *                 type: string
 *                 description: Tasks assigned to practice before next session
 *                 example: "Complete the 'Daily Appreciation' exercise each evening. Practice the 3-step communication process when discussing sensitive topics."
 *     responses:
 *       200:
 *         description: Reservation result created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationResultResponse'
 *       400:
 *         description: Reservation not found, duplicate result, or invalid input
 *       401:
 *         description: Authentication required - No token provided
 *       403:
 *         description: Permission denied - Only therapists can create results for their own sessions
 */

/**
 * @swagger
 * /reservation-result/get-reservation-result/{reservationResultID}:
 *   get:
 *     summary: Get a reservation result by ID
 *     description: Retrieves detailed information for a specific reservation result
 *     tags: [Reservation Results]
 *     parameters:
 *       - in: path
 *         name: reservationResultID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the reservation result to retrieve
 *     responses:
 *       200:
 *         description: Reservation result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationResultResponse'
 *       404:
 *         description: Reservation result not found
 */

/**
 * @swagger
 * /reservation-result/get-reservation-result/reservation/{reservationID}:
 *   get:
 *     summary: Get a reservation result by reservation ID
 *     description: Retrieves the therapy session result associated with a specific reservation
 *     tags: [Reservation Results]
 *     parameters:
 *       - in: path
 *         name: reservationID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the reservation to find results for
 *     responses:
 *       200:
 *         description: Reservation result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationResultResponse'
 *       400:
 *         description: Invalid reservation ID format
 *       404:
 *         description: Reservation not found or no result exists for this reservation
 */

/**
 * @swagger
 * /reservation-result/update-reservation-result/{reservationResultID}:
 *   put:
 *     summary: Update a reservation result (Therapist or Admin only)
 *     description: Updates an existing therapy session report. Only accessible by the therapist who created it or an admin.
 *     tags: [Reservation Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationResultID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the reservation result to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionSummary:
 *                 type: string
 *                 description: Updated session summary
 *               issuesIdentified:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated list of identified issues
 *               therapistRecommendations:
 *                 type: string
 *                 description: Updated therapist recommendations
 *               homeworkAssignment:
 *                 type: string
 *                 description: Updated homework assignments
 *     responses:
 *       200:
 *         description: Reservation result updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationResultResponse'
 *       400:
 *         description: Invalid reservation result ID format
 *       401:
 *         description: Authentication required - No token provided
 *       403:
 *         description: Permission denied - You can only update your own session results
 *       404:
 *         description: Reservation result or related reservation not found
 */

/**
 * @swagger
 * /reservation-result/delete-reservation-result/{reservationResultID}:
 *   put:
 *     summary: Soft delete a reservation result (Therapist or Admin only)
 *     description: Marks a reservation result as deleted without removing it from the database. Requires a deletion reason.
 *     tags: [Reservation Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationResultID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the reservation result to delete
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
 *                 description: Reason for deleting the reservation result
 *                 example: "Incorrect information recorded during session"
 *     responses:
 *       200:
 *         description: Reservation result deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationResultResponse'
 *       400:
 *         description: Delete reason is required or invalid ID format
 *       401:
 *         description: Authentication required - No token provided
 *       403:
 *         description: Permission denied - You can only delete your own session results
 *       404:
 *         description: Reservation result or related reservation not found
 */

/**
 * @swagger
 * /reservation-result/get-all-reservation-result/user/{userID}:
 *   get:
 *     summary: Get all reservation results for a user
 *     description: Retrieves all therapy session reports for a specific user. Users can only access their own results unless they are an admin.
 *     tags: [Reservation Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose results to retrieve
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
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Successfully retrieved reservation results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResultsResponse'
 *       400:
 *         description: Invalid user ID format
 *       401:
 *         description: Authentication required - No token provided
 *       403:
 *         description: Permission denied - You can only access your own reservation results
 */

/**
 * @swagger
 * /reservation-result/get-all-reservation-result/therapist/{coupleTherapistID}:
 *   get:
 *     summary: Get all reservation results created by a therapist
 *     description: Retrieves all therapy session reports created by a specific therapist. Therapists can only access their own results unless they are an admin.
 *     tags: [Reservation Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: coupleTherapistID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the therapist whose results to retrieve
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
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Successfully retrieved reservation results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResultsResponse'
 *       400:
 *         description: Invalid therapist ID format
 *       401:
 *         description: Authentication required - No token provided
 *       403:
 *         description: Permission denied - Only therapists can access their own session results
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

router.get(
  "/get-reservation-result/reservation/:reservationID",
  reservationResultController.getReservationResultByReservationID
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
