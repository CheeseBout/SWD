const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
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
      required: function () {
        return this.googleId ? false : true;
      },
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    photoURL: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "member", "couple_therapist"],
      default: "member",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
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
    googleId: String,
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    // Thêm logging để debug
    console.log("Entered password:", enteredPassword);
    console.log("Stored hashed password:", this.password);

    // So sánh trực tiếp với bcrypt
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
};

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Nếu password không thay đổi hoặc là Google user, bỏ qua validation
  if (!this.isModified("password") || this.isGoogleUser) {
    return next();
  }

  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});


const USER = mongoose.model("Users", userSchema);
module.exports = USER;
