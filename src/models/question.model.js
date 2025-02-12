const mongoose = require("mongoose");

const questionsSchema = new mongoose.Schema({
  questionBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuestionBank",
    required: true,
  },
  options: [
    {
      optionID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Options",
      },
      optionContent: {
        type: String,
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
      userAnswers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserAnswers",
        },
      ],
    },
  ],
  quizzes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quizzes",
      required: true,
    },
  ],
  userAnswers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAnswers",
    },
  ],
  questionContent: {
    type: String,
    required: true,
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

const QUESTIONS = mongoose.model("Questions", questionsSchema);
module.exports = QUESTIONS;
