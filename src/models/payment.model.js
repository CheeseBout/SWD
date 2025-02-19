const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
    required: true,
  },
  totalPrice: { type: Number, required: true }, // Tổng tiền cần thanh toán cho reservation
  totalPaid: { type: Number, default: 0 }, // Tổng tiền đã thanh toán (cập nhật sau mỗi transaction)
  status: {
    type: String,
    enum: ["PENDING", "COMPLETED"],
    default: "PENDING",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware cập nhật `updatedAt` khi có thay đổi
PaymentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const PAYMENT = mongoose.model("Payment", PaymentSchema);
module.exports = PAYMENT;
