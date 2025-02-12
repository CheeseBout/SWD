const mongoose = require("mongoose");
const reservationSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  coupleTherapistID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CoupleTherapist",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  packageID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CoupleTherapist",
  },
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    require: true,
  },
  status: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  meetingURL: {
    type: String,
    required: true,
    trim: true,
  },
});
const RESERVATION = mongoose.model("Reservation", reservationSchema);
module.exports = RESERVATION;
