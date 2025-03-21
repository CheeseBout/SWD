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
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Payment ID
 *         reservation:
 *           type: string
 *           description: Reservation ID
 *         totalPrice:
 *           type: number
 *           description: Total amount to be paid
 *         totalPaid:
 *           type: number
 *           description: Total amount already paid
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, CANCELED]
 *           description: Payment status
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Transaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Transaction ID
 *         payment:
 *           $ref: '#/components/schemas/Payment'
 *         phase:
 *           type: string
 *           enum: [DEPOSIT, FINAL]
 *           description: Payment phase
 *         amount:
 *           type: number
 *           description: Transaction amount
 *         method:
 *           type: string
 *           description: Payment method
 *         transactionCode:
 *           type: string
 *           description: Unique transaction code
 *         status:
 *           type: string
 *           enum: [PENDING, PAID, CANCELLED]
 *           description: Transaction status
 *         platform:
 *           type: string
 *           description: Platform where transaction occurred
 *         paymentMessage:
 *           type: string
 *           description: Additional payment message
 *         returnUrl:
 *           type: string
 *           nullable: true
 *           description: Return URL after payment
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *       401:ions);
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

/**
 * @swagger
 * /admin/revenue:
 *   get:
 *     summary: Get total revenue
 *     description: Endpoint for admins to view the total revenue generated
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total revenue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                   example: 1000
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Not an admin
 */
router.get("/revenue", auth, adminController.getSumMoneyPayment);

/**
 * @swagger
 * /admin/revenue-by-date:
 *   get:
 *     summary: Get revenue by date with paid transactions
 *     description: Endpoint for admins to view revenue data by date with only PAID transactions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue data with paid transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Success
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Not an admin
 */
router.get("/revenue-by-date", auth, adminController.getRevenueByDate);

/**
 * @swagger
 * /admin/transactions:
 *   get:
 *     summary: Get all transactions
 *     description: Endpoint for admins to view all transactions in the system
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Success
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 */
router.get("/transactions", auth, adminController.getAllTransactions);

/**
 * @swagger
 * /admin/payment/{paymentId}:
 *   get:
 *     summary: Get payment by ID
 *     description: Endpoint for admins to view details of a specific payment
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         description: ID of the payment to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Success
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized - Admin access required
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Payment not found
 */
router.get("/payment/:paymentId", auth, adminController.getPaymentById);

module.exports = router;
