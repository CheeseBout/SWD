const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: true,
  },
  phase: {
    type: String,
    enum: ["DEPOSIT", "FINAL", "REFUND"],
    required: true,
  },
  amount: { type: Number, required: true }, // Số tiền của transaction
  method: {
    type: String,
    enum: ["VNPAY", "PAYPAL", "CASH"], // Hỗ trợ nhiều phương thức thanh toán
    required: true,
  },
  transactionCode: { type: String, unique: true, required: true }, // Mã giao dịch từ VNPay hoặc hệ thống khác
  status: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED"],
    default: "PENDING",
  },
  createdAt: { type: Date, default: Date.now },
});

// Middleware cập nhật `Payment.totalPaid` sau mỗi Transaction thành công
TransactionSchema.post("save", async function (transaction, next) {
  if (transaction.status === "PAID") {
    const Payment = mongoose.model("Payment");
    await Payment.findByIdAndUpdate(transaction.payment, {
      $inc: { totalPaid: transaction.amount },
    });
  }
  next();
});

const TRANSACTION = mongoose.model("Transaction", TransactionSchema);
module.exports = TRANSACTION;
