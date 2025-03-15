const QUIZZES = require("../models/quizzes.model");
const QUESTIONS = require("../models/question.model");
const TOPIC = require("../models/topic.model");

class QuizRepository {
  async findAllQuizzes() {
    return await QUIZZES.find().populate("questions").populate("userAnswer");
  }

  async findQuizById(quizId) {
    try {
      const quizFromQuizzes = await QUIZZES.findById(quizId);
      if (!quizFromQuizzes) {
        return null;
      }

      const topic = await TOPIC.findOne({ "quiz._id": quizId });
      if (!topic) {
        return null;
      }

      const quizFromTopic = topic.quiz.find((q) => q._id.toString() === quizId);
      if (!quizFromTopic) {
        return null;
      }

      // Get all questions from the quiz without sorting
      const questions = await QUESTIONS.find({
        _id: { $in: quizFromQuizzes.questions || [] },
      }).select(
        "questionContent options status createdAt lastEdited questionBank quizzes userAnswers"
      );

      const sortedQuestions = [...questions].sort(
        (a, b) => a.createdAt - b.createdAt
      );

      // Combine data from both sources
      return {
        _id: quizFromTopic._id,
        quizName: quizFromTopic.quizName,
        quizDescription: quizFromTopic.quizDescription,
        questions: sortedQuestions,
        userAnswer: quizFromTopic.userAnswer || [],
        imageUrl: quizFromTopic.imageUrl,
        status: quizFromTopic.status,
        createdAt: quizFromTopic.createdAt,
        lastEdited: quizFromTopic.lastEdited,
      };
    } catch (error) {
      console.error("Error in findQuizById:", error);
      throw error;
    }
  }

  async createQuiz(quizData) {
    return await QUIZZES.create(quizData);
  }

  async populateQuizQuestions(quiz) {
    if (!quiz) return null;

    const topic = await TOPIC.findOne({ "quiz._id": quiz._id }).populate({
      path: "quiz.questions",
      model: QUESTIONS, // Use the imported model directly
      select:
        "questionText options correctAnswer explanation category difficulty",
    });

    if (!topic) return quiz;

    const populatedQuiz = topic.quiz.find(
      (q) => q._id.toString() === quiz._id.toString()
    );
    return populatedQuiz || quiz;
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
    try {
      // Update quiz in topic
      const topic = await TOPIC.findOne({
        "quiz._id": quizId,
      });

      if (!topic) {
        throw new Error("Quiz not found in any topic");
      }

      const quiz = topic.quiz.id(quizId);
      quiz.status = status;
      quiz.deletedReason = deletedReason;
      quiz.lastEdited = Date.now();

      await topic.save();

      await QUIZZES.findByIdAndUpdate(
        quizId,
        {
          status: status,
          lastEdited: Date.now(),
        },
        { new: true }
      );

      return quiz;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new QuizRepository();
