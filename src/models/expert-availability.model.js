const mongoose = require("mongoose");
const expertAvailabilitySchema = new mongoose.Schema({
  expertID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expert",
    required: true,
  },
  timeAvailable: {
    type: Date,
  },
  notTimeAvailable: {
    type: Date,
  },
});

const EXPERTAVAILABILITY = mongoose.model(
  "ExpertAvailability",
  expertAvailabilitySchema
);
module.exports = EXPERTAVAILABILITY;
