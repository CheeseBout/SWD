const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { auth } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Certificate:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user receiving the certificate
 *         courseId:
 *           type: string
 *           description: ID of the completed course
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         issuedDate:
 *           type: string
 *           format: date
 *         expiryDate:
 *           type: string
 *           format: date
 */

/**
 * @swagger
 * /admin/manage-certificate:
 *   post:
 *     summary: Manage user certificates
 *     description: Endpoint for admins to manage user certificates (approve/reject/issue)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - certificateID
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject, issue]
 *                 description: Action to perform on the certificate
 *               certificateID:
 *                 type: string
 *                 description: ID of the certificate to manage
 *               reason:
 *                 type: string
 *                 description: Optional. Only required when action is 'deny'
 *     responses:
 *       200:
 *         description: Certificate managed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Certificate updated successfully"
 *                 certificate:
 *                   $ref: '#/components/schemas/Certificate'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid action specified"
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: User or course not found
 */
router.post("/manage-certificate", auth, adminController.manageCertificate);

/**
 * @swagger
 * /admin/certificate-requests:
 *   get:
 *     summary: Get all certificate requests
 *     description: Endpoint for admins to view all pending certificate requests
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of certificate requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Certificate'
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Not an admin
 */
router.get(
  "/certificate-requests",
  auth,
  adminController.getAllCertificateRequests
);

module.exports = router;
