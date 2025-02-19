const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/payment.controller");

// Tạo thanh toán cho một Reservation
router.post("/create-payment", PaymentController.createPayment);

// Tạo URL thanh toán (Deposit / Final Payment)
router.post("/create-payment-url", PaymentController.createPaymentUrl);

// Xử lý phản hồi từ VNPay (IPN)
router.get("/verify-payment", PaymentController.verifyPayment);

// Lấy tất cả Payment
router.get("/all", PaymentController.getAllPayments);

// Lấy tất cả Transaction của một Payment
router.get(
  "/:paymentID/transactions",
  PaymentController.getTransactionsByPayment
);

module.exports = router;
