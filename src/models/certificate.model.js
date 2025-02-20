const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
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
});

const CERTIFICATE = mongoose.model("Certificate", certificateSchema);
module.exports = CERTIFICATE;
