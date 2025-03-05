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
 *               - userId
 *               - action
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user
 *               action:
 *                 type: string
 *                 enum: [approve, reject, issue]
 *                 description: Action to perform on the certificate
 *               courseId:
 *                 type: string
 *                 description: Required when action is 'issue'
 *               reason:
 *                 type: string
 *                 description: Required when action is 'reject'
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

module.exports = router;
