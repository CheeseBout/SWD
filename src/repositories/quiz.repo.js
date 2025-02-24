const QUIZZES = require("../models/quizzes.model");
const QUESTIONS = require("../models/question.model");
const TOPIC = require("../models/topic.model");

class QuizRepository {
  async findAllQuizzes() {
    return await QUIZZES.find().populate("questions").populate("userAnswer");
  }

  async findQuizById(quizId) {
    return await QUIZZES.findById(quizId)
      .populate("questions")
      .populate("userAnswer");
  }

  async createQuiz(quizData) {
    return await QUIZZES.create(quizData);
  }

  async populateQuizQuestions(quiz) {
    return await quiz.populate("questions");
  }

  async updateQuestionsWithQuizId(quizId) {
    return await QUESTIONS.findOneAndUpdate(
      {},
      {
        $push: { quizzes: quizId },
      },
      { new: true }
    );
  }

  async updateTopicWithQuiz(topicId, quiz) {
    return await TOPIC.findByIdAndUpdate(
      topicId,
      {
        $push: { quiz: quiz },
        lastEdited: Date.now(),
      },
      { new: true }
    );
  }

  async updateQuiz(quizId, updateData) {
    return await QUIZZES.findByIdAndUpdate(
      quizId,
      { ...updateData, lastEdited: Date.now() },
      { new: true }
    ).populate("questions");
  }

  async updateQuizStatus(quizId, status, deletedReason) {
    return await QUIZZES.findByIdAndUpdate(
      quizId,
      {
        status,
        deletedReason,
        lastEdited: Date.now(),
      },
      { new: true }
    );
  }
}

module.exports = new QuizRepository();
