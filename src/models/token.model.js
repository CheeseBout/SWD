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
  expiryDate: {
    type: Date,
    required: true,
  },
  refreshTokenExpiryDate: {
    type: Date,
  },
  // Chỉ lưu googleToken
  googleToken: {
    type: String,
    default: null,
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
