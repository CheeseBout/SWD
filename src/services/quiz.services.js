const QUESTIONS = require("../models/question.model");
const QUIZZES = require("../models/quizzes.model");
const APIError = require("../utils/ApiError");

class QuizService {
  async getAllQuiz() {
    const data = await QUIZZES.find()
      .populate("questions")
      .populate("userAnswer");
    return { data };
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

      return { data };
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

    const { quizName, quizDescription, questions } = req.body;

    try {
      // Kiểm tra questions có tồn tại không
      if (questions && questions.length > 0) {
        const existingQuestions = await QUESTIONS.find({
          _id: { $in: questions },
          status: "active",
        });

        if (existingQuestions.length !== questions.length) {
          throw new APIError(
            400,
            "One or more questions not found or inactive"
          );
        }
      }

      const createdQuiz = await QUIZZES.create({
        quizName,
        quizDescription,
        questions,
        lastEdited: Date.now(),
      });

      const populatedQuiz = await createdQuiz.populate("questions");

      return {
        success: true,
        data: populatedQuiz,
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
      const updatedQuiz = await QUIZZES.findByIdAndUpdate(quizId, updateData, {
        new: true,
      }).populate("questions");

      if (!updatedQuiz) {
        throw new APIError(404, "Quiz not found");
      }

      return {
        success: true,
        data: updatedQuiz,
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
        data: deletedQuiz,
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
