const mongoose = require("mongoose");
const reservationSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expertID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expert",
    required: true,
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true,
  },
  content: {
    type: String,
  },
  packageID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
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
