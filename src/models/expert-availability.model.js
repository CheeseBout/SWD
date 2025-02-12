const mongoose = require("mongoose");
const expertAvailabilitySchema = new mongoose.Schema({
  coupleTherapistID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CoupleTherapist",
    required: true,
  },
  timeAvailable: {
    type: Date,
  },
  notTimeAvailable: {
    type: Date,
  },
});

const COUPLETHERAPIST_AVAILABILITY = mongoose.model(
  "ExpertAvailability",
  expertAvailabilitySchema
);
module.exports = COUPLETHERAPIST_AVAILABILITY;
