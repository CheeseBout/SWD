const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  photoURL: {
    type: String,
  },
  address: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    enum: ["user", "couple_therapist", "admin"],
    default: "user",
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  userAnswers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAnswers",
    },
  ],
  reservationID: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
    },
  ],
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const USER = mongoose.model("Users", userSchema);
module.exports = USER;
