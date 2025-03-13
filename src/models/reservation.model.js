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
    reason: {
      type: String,
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
      enum: [
        "pending",
        "confirmed",
        "completed",
        "canceled",
        "denied",
        "deposited",
      ],
      default: "pending",
    },
    totalPrice: {
      type: Number,
      default: 0,
      // required: true,
    },
    meetingURL: {
      type: String,
      default: "",
      // required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const RESERVATION = mongoose.model("Reservation", reservationSchema);
module.exports = RESERVATION;
