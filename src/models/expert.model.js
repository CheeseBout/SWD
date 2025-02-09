const mongoose = require("mongoose");

const expertSchema = new mongoose.Schema({
  expertID: {
    type: String,
    required: true,
    unique: true,
  },
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
