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
    require: true,
  },
  address: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    enum: ["user", "expert", "admin"],
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
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const USER = mongoose.model("User", userSchema);
module.exports = USER;
