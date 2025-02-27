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

  async updateQuestionsWithQuizId(quizId, questionID) {
    return await QUESTIONS.findOneAndUpdate(
      { _id: questionID }, // Fix: Use proper filter object
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
    const { questionID, ...otherUpdates } = updateData;

    if (questionID) {
      // First update the question with quiz reference
      await QUESTIONS.findByIdAndUpdate(
        questionID,
        {
          $addToSet: { quizzes: quizId }, // Use addToSet to prevent duplicates
          lastEdited: Date.now(),
        },
        { new: true }
      );

      // Update quiz details in TOPIC collection
      if (otherUpdates.quizName || otherUpdates.quizDescription) {
        await TOPIC.updateMany(
          { "quiz._id": quizId },
          {
            $set: {
              "quiz.$.quizName": otherUpdates.quizName,
              "quiz.$.quizDescription": otherUpdates.quizDescription,
              "quiz.$.lastEdited": Date.now(),
            },
          }
        );
      }

      // Then update the quiz with question reference
      return await QUIZZES.findByIdAndUpdate(
        quizId,
        {
          $addToSet: { questions: questionID }, // Use addToSet to prevent duplicates
          ...otherUpdates,
        },
        { new: true }
      ).populate("questions");
    }

    return await QUIZZES.findByIdAndUpdate(quizId, otherUpdates, {
      new: true,
    }).populate("questions");
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
