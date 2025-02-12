const mongoose = require("mongoose");

const userAnswersSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  quizID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quizzes",
    required: true,
  },
  questionID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Questions",
    required: true,
  },
  optionID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Options",
    required: true,
  },
  quizResultsID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuizResults",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const USER_ANSWERS = mongoose.model("UserAnswers", userAnswersSchema);
module.exports = USER_ANSWERS;
