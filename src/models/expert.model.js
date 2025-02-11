const mongoose = require("mongoose");

const expertSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  certificate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Certificate",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const EXPERT = mongoose.model("Expert", expertSchema);
module.exports = EXPERT;
