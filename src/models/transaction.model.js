const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: true,
  },
  phase: {
    type: String,
    enum: ["DEPOSIT", "FINAL"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    enum: ["VNPAY"],
    default: "VNPAY",
  },
  transactionCode: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["PENDING", "PAID", "CANCELLED"],
    default: "PENDING",
  },
  platform: {
    type: String,
    enum: ["web", "mobile", "other"],
    default: "web",
  },
  paymentMessage: {
    type: String,
    default: "",
  },
  returnUrl: {
    type: String,
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
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

// Middleware cập nhật `updatedAt` khi có thay đổi
TransactionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const TRANSACTION = mongoose.model("Transaction", TransactionSchema);
module.exports = TRANSACTION;
