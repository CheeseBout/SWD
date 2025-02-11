const mongoose = require("mongoose");
const reservationResultSchema = new mongoose.Schema({
  reservationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
    required: true,
  },
  questions: {
    type: String,
    required: true,
    trim: true,
  },
  answers: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  deleteReason: {
    type: String,
  },
});
const RESERVATIONRESULT = mongoose.model(
  "ReservationResult",
  reservationResultSchema
);
module.exports = RESERVATIONRESULT;
