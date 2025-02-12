const mongoose = require("mongoose");

const quizzesSchema = new mongoose.Schema({
  userAnswer: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAnswers",
    },
  ],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastEdited: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  deletedReason: {
    type: String,
  },
});

const QUIZZES = mongoose.model("Quizzes", quizzesSchema);
module.exports = QUIZZES;
