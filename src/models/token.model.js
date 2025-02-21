const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  accessToken: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  emailVerificationToken: {
    type: String,
  },
  googleToken: {
    type: String,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const TOKEN = mongoose.model("Token", tokenSchema);
module.exports = TOKEN;
