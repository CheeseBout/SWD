const mongoose = require("mongoose");
const ratingSchema = mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    coupleTherapistID: {
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
      min: 1,
      max: 5,
      required: true,
    },
    status: {
      type: String,
      enum: ["created", "deleted"],
      default: "created",
    },
  },
  { timestamps: true }
);
const RATING = mongoose.model("Rating", ratingSchema);
module.exports = RATING;
