const mongoose = require("mongoose");

const coupleTherapistSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  certificate: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
      required: true,
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
