const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    coupleTherapistID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoupleTherapist",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    comissionFee: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const PACKAGE = mongoose.model("Package", packageSchema);
module.exports = PACKAGE;
