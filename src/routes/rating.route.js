const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/rating.controller");
const { auth } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Therapist ratings management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *           description: ID of user giving the rating
 *         therapistId:
 *           type: string
 *           description: ID of therapist being rated
 *         score:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating score (1-5 stars)
 *         comment:
 *           type: string
 *           description: Review comment
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /rating:
 *   post:
 *     summary: Create a new rating
 *     tags: [Ratings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - therapistId
 *               - score
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "65f2d6789abcdef01234567"
 *               therapistId:
 *                 type: string
 *                 example: "65f2d6789abcdef01234568"
 *               score:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Excellent counseling session, very helpful!"
 *     responses:
 *       201:
 *         description: Rating created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Duplicate rating or invalid input
 */

/**
 * @swagger
 * /rating:
 *   get:
 *     summary: Get all ratings
 *     tags: [Ratings]
 *     parameters:
 *       - in: query
 *         name: therapistId
 *         schema:
 *           type: string
 *         description: Filter ratings by therapist ID
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
 *         description: Ratings per page
 *     responses:
 *       200:
 *         description: List of ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ratings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rating'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 */

/**
 * @swagger
 * /rating/{ratingId}:
 *   get:
 *     summary: Get rating by ID
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rating details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       404:
 *         description: Rating not found
 *   put:
 *     summary: Update a rating
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: ratingId
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
 *               score:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Duplicate rating or invalid input
 *       404:
 *         description: Rating not found
 *   delete:
 *     summary: Delete a rating
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 *       404:
 *         description: Rating not found
 */

/**
 * @swagger
 * /rating/therapist/{therapistId}:
 *   get:
 *     summary: Get all ratings for a specific therapist
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: therapistId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the therapist
 *     responses:
 *       200:
 *         description: List of therapist ratings
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
 *                   example: "Therapist ratings retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Missing therapist ID parameter
 *       404:
 *         description: No ratings found for this therapist
 */

/**
 * @swagger
 * /rating/check/{reservationID}:
 *   get:
 *     summary: Check if ratings exist for a specific reservation
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the reservation
 *     responses:
 *       200:
 *         description: Rating check results
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
 *                   example: "Rating check completed"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Error checking rating
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Permission denied
 */

router.post("/", auth, ratingController.createRating);
router.get("/", ratingController.getAllRating);
router.get("/therapist/:therapistId", ratingController.getRatingByTherapistId);
router.get(
  "/check/:reservationID",
  auth,
  ratingController.checkRatingForReservation
);
router.get("/:ratingId", ratingController.getRatingById);
router.put("/:ratingId", auth, ratingController.updateRating);
router.delete("/:ratingId", auth, ratingController.deleteRating);

module.exports = router;
