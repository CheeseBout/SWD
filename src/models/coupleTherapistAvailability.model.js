const mongoose = require("mongoose");
const coupleTherapistAvailabilitySchema = new mongoose.Schema({
  coupleTherapistID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CoupleTherapists",
    required: true,
  },
  timeAvailable: [
    {
      type: Date,
    },
  ],
  notTimeAvailable: [
    {
      type: Date,
    },
  ],
});

const COUPLETHERAPIST_AVAILABILITY = mongoose.model(
  "CoupleTherapistAvailability",
  coupleTherapistAvailabilitySchema
);
module.exports = COUPLETHERAPIST_AVAILABILITY;
