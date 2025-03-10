const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/payment.controller");

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         reservation:
 *           type: string
 *           description: Reservation ID reference
 *         totalAmount:
 *           type: number
 *         totalPaid:
 *           type: number
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED]
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Transaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         payment:
 *           type: string
 *           description: Payment ID reference
 *         phase:
 *           type: string
 *           enum: [DEPOSIT, FINAL]
 *         amount:
 *           type: number
 *         method:
 *           type: string
 *           enum: [VNPAY]
 *         transactionCode:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, PAID, FAILED]
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /payment/create-payment-url:
 *   post:
 *     summary: Create VNPay payment URL
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationID
 *               - phase
 *             properties:
 *               reservationID:
 *                 type: string
 *                 example: "65f2d6789abcdef01234567"
 *               phase:
 *                 type: string
 *                 enum: [DEPOSIT, FINAL]
 *                 example: "DEPOSIT"
 *               totalPrice:
 *                 type: number
 *                 example: 1000000
 *     responses:
 *       200:
 *         description: Payment URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentUrl:
 *                   type: string
 *                   example: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Invalid input or payment phase
 */

/**
 * @swagger
 * /payment/verify-payment:
 *   get:
 *     summary: Verify VNPay payment return
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: vnp_Amount
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: vnp_SecureHash
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /payment/all:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED]
 *     responses:
 *       200:
 *         description: List of payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 */

/**
 * @swagger
 * /payment/{paymentID}/transactions:
 *   get:
 *     summary: Get all transactions for a payment
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: paymentID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Payment not found
 */

// Tạo thanh toán cho một Reservation

// Tạo URL thanh toán (Deposit / Final Payment)
router.post("/create-payment-url", PaymentController.createPaymentUrl);

// Xử lý IPN từ VNPay
router.get("/vnpay-ipn", PaymentController.verifyIPN);

// Xử lý redirect từ VNPay sau khi thanh toán
router.get("/vnpay-return", PaymentController.verifyReturnUrl);

// Kiểm tra và cập nhật trạng thái giao dịch
router.post("/check-payment-status", PaymentController.checkPaymentStatus);

// Lấy tất cả Payment
router.get("/all", PaymentController.getAllPayments);

// Lấy tất cả Transaction của một Payment
router.get(
  "/:paymentID/transactions",
  PaymentController.getTransactionsByPayment
);

// Debug route to test if route is accessible
router.get("/test", (req, res) => {
  res.status(200).json({
    message: "Payment routes are working",
    timestamp: new Date(),
  });
});

module.exports = router;
