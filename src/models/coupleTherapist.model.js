const mongoose = require("mongoose");

const coupleTherapistSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    description: {
      type: String,
      default: "New Couple Therapist",
    },
    certificates: [
      {
        certificateID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Certificates",
        },
        title: String,
        issuedDate: Date,
        expiryDate: Date,
        documentURL: String,
        category: String,
        status: {
          type: String,
          enum: ["pending", "approved", "denied"],
          default: "pending",
        },
        processedAt: Date,
        processedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
        },
        denialReason: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    package: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Packages",
      },
    ],
    category: {
      type: String,
      default: "General",
    },
    availability: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CoupleTherapistAvailabilities",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const COUPLETHERAPIST = mongoose.model(
  "CoupleTherapist",
  coupleTherapistSchema
);
module.exports = COUPLETHERAPIST;
