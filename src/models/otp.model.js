const { Schema, model } = require("mongoose");
const { otpTypes } = require("../configs/token.config");
const otpSchema = new Schema(
  {
    email: String,
    otp: String,
    token: String,
    type: {
      type: String,
      enum: Object.values(otpTypes),
    },
    time: { type: Date, default: Date.now(), index: { expires: 300 } }, //
  },
  {
    timestamps: true,
  }
);

const OTP = model("Otp", otpSchema);
module.exports = OTP;
