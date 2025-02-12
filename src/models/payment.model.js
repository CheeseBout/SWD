const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema({
  reservationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
    required: true,
  },
  totalPrice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  content: {
    type: String,
    trim: true,
  },
  note: {
    type: String,
    trim: true,
  },
});
const PAYMENT = mongoose.model("Payment", paymentSchema);
module.exports = PAYMENT;
