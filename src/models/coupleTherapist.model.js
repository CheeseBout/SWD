const mongoose = require("mongoose");

const coupleTherapistSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    description: {
      type: String,
      default: "New Couple Therapist",
    },
    isUpdatedInformation: {
      type: Boolean,
      default: false,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    ratingSum: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    certificates: [
      {
        certificateID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Certificates",
        },
        title: String,
        issuedDate: Date,
        expiryDate: Date,
        documentURL: String,
        category: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Categories",
          },
        ],
        status: {
          type: String,
          enum: ["pending", "approved", "denied"],
          default: "pending",
        },
        processedAt: Date,
        processedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
        },
        denialReason: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    package: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Packages",
      },
    ],
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Categories" }],
    availability: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CoupleTherapistAvailabilities",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Thêm middleware để tự động tính toán averageRating khi lưu
coupleTherapistSchema.pre("save", function (next) {
  if (this.ratingCount > 0) {
    this.averageRating = this.ratingSum / this.ratingCount;
  }
  next();
});

const COUPLETHERAPIST = mongoose.model(
  "CoupleTherapist",
  coupleTherapistSchema
);
module.exports = COUPLETHERAPIST;
