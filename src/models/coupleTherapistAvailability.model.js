const mongoose = require("mongoose");
const coupleTherapistAvailabilitySchema = new mongoose.Schema({
  coupleTherapistID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CoupleTherapists",
    required: true,
  },
  timeAvailable: [
    {
      startHour: {
        type: Date,
      },
      endHour: {
        type: Date,
      },
      isOccupied: {
        type: Boolean,
        default: false,
      },
    },
  ],
  notTimeAvailable: [
    {
      startHour: {
        type: Date,
      },
      endHour: {
        type: Date,
      },
    },
  ],
});

const COUPLETHERAPIST_AVAILABILITY = mongoose.model(
  "CoupleTherapistAvailability",
  coupleTherapistAvailabilitySchema
);
module.exports = COUPLETHERAPIST_AVAILABILITY;
