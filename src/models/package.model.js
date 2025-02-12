const { required } = require("joi");
const mongoose = require("mongoose");
const packageSchema = new mongoose.Schema({
  coupleTherapistID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CoupleTherapist",
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  times: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});
const PACKAGE = mongoose.model("Package", packageSchema);
module.exports = PACKAGE;
