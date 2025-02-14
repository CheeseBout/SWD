const mongoose = require("mongoose");
const ratingSchema = mongoose.Schema({
  reservationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
    required: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
    required: true,
  },
  expertID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
    require: true,
  },
  content: {
    type: String,
    trim: true,
  },
  rate: {
    type: Number,
    required: true,
  },
});
