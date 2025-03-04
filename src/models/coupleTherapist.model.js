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
          ref: "Certificate",
        },
        title: String,
        issuedDate: Date,
        expiryDate: Date,
        documentURL: String,
        category: String,
        isCertificateVerified: {
          type: Boolean,
          default: false,
        },
        reason: {
          type: String,
          default: "",
        },
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
    rating: {
      type: Number,
      default: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
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
