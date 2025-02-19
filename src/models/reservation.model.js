const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    coupleTherapistID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoupleTherapists",
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
      ref: "Package",
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "canceled"],
      default: "pending",
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
  },
  { timestamps: true }
);

const RESERVATION = mongoose.model("Reservation", reservationSchema);
module.exports = RESERVATION;
