const mongoose = require("mongoose");

const coupleTherapistSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  certificates: [
    {
      _id: false, // Tắt auto-generate _id
      certificateID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Certificates",
      },
      title: {
        type: String,
        required: true,
      },
      issuedDate: {
        type: Date,
        required: true,
      },
      updatedAt: {
        type: Date,
        default: Date.now(),
      },
      expiryDate: {
        type: Date,
      },
      documentURL: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        required: true,
      },
      isCertificateVerified: {
        type: Boolean,
        default: false,
      },
    },
  ],
  description: {
    type: String,
    required: true,
  },
  packageID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
  },
  reservationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
  },
});

const COUPLETHERAPIST = mongoose.model(
  "CoupleTherapists",
  coupleTherapistSchema
);
module.exports = COUPLETHERAPIST;
