const mongoose = require("mongoose");
const reservationResultSchema = new mongoose.Schema(
  {
    reservationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
    },
    sessionSummary: {
      type: String,
      required: true,
      trim: true,
    },
    issuesIdentified: [
      {
        type: String,
        required: true,
      },
    ],
    therapistRecommendations: {
      type: String,
      required: true,
    },
    homeworkAssignment: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "deleted", "final_completed"],
    },
    deleteReason: {
      type: String,
    },
  },
  { timestamps: true }
);
const RESERVATIONRESULT = mongoose.model(
  "ReservationResult",
  reservationResultSchema
);
module.exports = RESERVATIONRESULT;
