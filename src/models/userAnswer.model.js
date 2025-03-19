const mongoose = require("mongoose");

const userAnswerSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    quizID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quizzes",
      required: false, // Make it optional
    },
    // These fields are for backward compatibility
    questionID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Questions",
    },
    optionID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    // New fields for combined answers
    totalScore: {
      type: Number,
      default: 0,
    },
    selections: [
      {
        questionID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Questions",
        },
        optionID: {
          type: mongoose.Schema.Types.ObjectId,
        },
        score: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserAnswers", userAnswerSchema);
