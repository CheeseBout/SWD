const express = require("express");
const router = express.Router();
const coupleTherapistController = require("../controllers/coupleTherapist.controller");
const { checkCertificate, auth } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Couple Therapist
 *   description: Couple therapist management and availability
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Availability:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         therapistId:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         timeSlots:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *               isBooked:
 *                 type: boolean
 *     CoupleTherapist:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         fullName:
 *           type: string
 *         email:
 *           type: string
 *         expertise:
 *           type: string
 *         experience:
 *           type: number
 *         qualification:
 *           type: string
 *         rating:
 *           type: number
 */

/**
 * @swagger
 * /coupletherapist:
 *   get:
 *     summary: Get all couple therapists
 *     tags: [Couple Therapist]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: expertise
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of couple therapists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 therapists:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CoupleTherapist'
 */
router.get("/", coupleTherapistController.getAllCoupleTherapist);

/**
 * @swagger
 * /coupletherapist/{coupleTherapistId}:
 *   get:
 *     summary: Get couple therapist by ID
 *     tags: [Couple Therapist]
 *     parameters:
 *       - in: path
 *         name: coupleTherapistId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Couple therapist details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoupleTherapist'
 *       404:
 *         description: Therapist not found
 */
router.get(
  "/:coupleTherapistId",
  coupleTherapistController.getCoupleTherapistById
);

/**
 * @swagger
 * /coupletherapist/create-availability:
 *   post:
 *     summary: Create availability slots
 *     tags: [Couple Therapist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - timeSlots
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               timeSlots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     startTime:
 *                       type: string
 *                       format: time
 *                     endTime:
 *                       type: string
 *                       format: time
 *     responses:
 *       201:
 *         description: Availability created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a certified therapist
 */
router.post(
  "/create-availability",
  auth,
  checkCertificate,
  coupleTherapistController.createAvailability
);

/**
 * @swagger
 * /coupletherapist/get-availability/{id}:
 *   get:
 *     summary: Get therapist availability by ID
 *     tags: [Couple Therapist]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Therapist availability details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Availability'
 *       404:
 *         description: Availability not found
 */
router.get(
  "/get-availability/:id",
  coupleTherapistController.getAvailabilityById
);

/**
 * @swagger
 * /coupletherapist/update-availability/{availabilityID}:
 *   put:
 *     summary: Update availability slot
 *     tags: [Couple Therapist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: availabilityID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Availability'
 *     responses:
 *       200:
 *         description: Availability updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a certified therapist
 */
router.put(
  "/update-availability/:availabilityID",
  auth,
  checkCertificate,
  coupleTherapistController.updateAvailability
);

/**
 * @swagger
 * /coupletherapist/delete-availability/{availabilityID}:
 *   put:
 *     summary: Delete availability slot
 *     tags: [Couple Therapist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: availabilityID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Availability deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a certified therapist
 */
router.put(
  "/delete-availability/:availabilityID",
  auth,
  checkCertificate,
  coupleTherapistController.deleteAvailability
);

module.exports = router;
