const mongoose = require("mongoose");

const quizResultsSchema = new mongoose.Schema({
  quizID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quizzes",
    required: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  userAnswers: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserAnswers",
    required: true,
   // Đảm bảo quan hệ 1-1
  },
  totalScore: {
    type: Number,
    required: true,
  },
  resultType: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const QUIZRESULTS = mongoose.model("QuizResults", quizResultsSchema);
module.exports = QUIZRESULTS;