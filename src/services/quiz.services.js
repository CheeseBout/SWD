const QUESTIONS = require("../models/question.model");
const QUIZZES = require("../models/quizzes.model");
const APIError = require("../utils/ApiError");

class QuizService {
  async getAllQuiz() {
    const data = await QUIZZES.find()
      .populate("questions")
      .populate("userAnswer");
    return { quizzes: data };
  }

  async getQuizById(quizId) {
    try {
      const data = await QUIZZES.findById(quizId)
        .populate("questions")
        .populate("userAnswer");

      if (!data) {
        throw new APIError(404, "Quiz not found");
      }

      if (data.status === "inactive") {
        throw new APIError(400, "Quiz is inactive");
      }

      return { quiz: data };
    } catch (error) {
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid quiz ID format");
      }
      throw error;
    }
  }

  async createQuiz(req) {
    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can create quiz");
    }

    const { quizName, quizDescription, questions, imageUrl } = req.body;

    try {
      const createdQuiz = await QUIZZES.create({
        quizName,
        quizDescription,
        questions,
        imageUrl,
        lastEdited: Date.now(),
      });

      const populatedQuiz = await createdQuiz.populate("questions");

      await QUESTIONS.findOneAndUpdate(
        {},
        {
          $push: { quizzes: createdQuiz._id },
        },
        { new: true }
      );

      return {
        success: true,
        quiz: populatedQuiz,
      };
    } catch (error) {
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid question ID format");
      }
      throw error;
    }
  }

  async updateQuiz(req) {
    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can update quiz");
    }

    const { quizId } = req.params;
    const updateData = { ...req.body, lastEdited: Date.now() };

    try {
      console.log(quizId);
      const updatedQuiz = await QUIZZES.findByIdAndUpdate(quizId, updateData, {
        new: true,
      }).populate("questions");

      if (!updatedQuiz) {
        throw new APIError(404, "Quiz not found");
      }

      return {
        success: true,
        quiz: updatedQuiz,
      };
    } catch (error) {
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid quiz ID format");
      }
      throw error;
    }
  }

  async deleteQuiz(req) {
    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can delete quiz");
    }

    const { quizId } = req.params;
    const { deletedReason } = req.body;

    try {
      const deletedQuiz = await QUIZZES.findByIdAndUpdate(
        quizId,
        {
          status: "inactive",
          deletedReason,
          lastEdited: Date.now(),
        },
        { new: true }
      );

      if (!deletedQuiz) {
        throw new APIError(404, "Quiz not found");
      }

      return {
        success: true,
        message: "Quiz deleted successfully",
        quiz: deletedQuiz,
      };
    } catch (error) {
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid quiz ID format");
      }
      throw error;
    }
  }
}

module.exports = new QuizService();
