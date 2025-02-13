const mongoose = require("mongoose");

const userAnswersSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  quizID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quizzes",
  },
  questionID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Questions",
  },
  optionID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Options",
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  selectedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const USER_ANSWERS = mongoose.model("UserAnswers", userAnswersSchema);
module.exports = USER_ANSWERS;
