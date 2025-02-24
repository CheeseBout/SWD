const APIError = require("../utils/ApiError");
const quizRepo = require("../repositories/quiz.repo");

class QuizService {
  async getAllQuiz() {
    const data = await quizRepo.findAllQuizzes();
    return { quizzes: data };
  }

  async getQuizById(quizId) {
    try {
      const data = await quizRepo.findQuizById(quizId);

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
    if (req.user.role === "admin" || req.user.role === "couple_therapist") {
      throw new APIError(403, "Only admin can create quiz");
    }

    const { quizName, quizDescription, questions, imageUrl, topicID } =
      req.body;

    try {
      const createdQuiz = await quizRepo.createQuiz({
        quizName,
        quizDescription,
        questions,
        imageUrl,
        lastEdited: Date.now(),
      });

      const populatedQuiz = await quizRepo.populateQuizQuestions(createdQuiz);
      await quizRepo.updateQuestionsWithQuizId(createdQuiz._id);
      await quizRepo.updateTopicWithQuiz(topicID, populatedQuiz);

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
    if (req.user.role === "admin" || req.user.role === "couple_therapist") {
      throw new APIError(403, "Only admin can update quiz");
    }

    const { quizId } = req.params;
    const updateData = { ...req.body };

    try {
      const updatedQuiz = await quizRepo.updateQuiz(quizId, updateData);

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
    if (req.user.role === "admin" || req.user.role === "couple_therapist") {
      throw new APIError(403, "Only admin can delete quiz");
    }

    const { quizId } = req.params;
    const { deletedReason } = req.body;

    try {
      const deletedQuiz = await quizRepo.updateQuizStatus(
        quizId,
        "inactive",
        deletedReason
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
