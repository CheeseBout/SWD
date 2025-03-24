const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    coupleTherapistID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoupleTherapist",
    },
    title: {
      type: String,
      required: true,
    },
    issuedDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
    },
    documentURL: {
      type: String,
      required: true,
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categories",
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "denied"],
      default: "pending",
    },
    processedAt: {
      type: Date,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    denialReason: {
      type: String,
    },
  },
  { timestamps: true }
);

const CERTIFICATE = mongoose.model("Certificates", certificateSchema);
module.exports = CERTIFICATE;
