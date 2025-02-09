const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
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
});

const CERTIFICATE = mongoose.model("Certificate", certificateSchema);
module.exports = CERTIFICATE;
