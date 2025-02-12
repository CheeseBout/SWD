const mongoose = require("mongoose");

const quizzesSchema = new mongoose.Schema({
  quizName: {
    type: String,
    required: true,
  },
  quizDescription: {
    type: String,
    required: true,
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Questions",
    },
  ],
  userAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserAnswers",
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  deletedReason: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastEdited: {
    type: Date,
    default: Date.now,
  },
});

const QUIZZES = mongoose.model("Quizzes", quizzesSchema);
module.exports = QUIZZES;
