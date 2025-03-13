const APIError = require("../utils/ApiError");
const quizRepo = require("../repositories/quiz.repo");

class QuizService {
  async getAllQuiz() {
    const data = await quizRepo.findAllQuizzes();
    return { quizzes: data };
  }

  async getQuizById(quizId) {
    try {
      console.log(quizId);
      let data = await quizRepo.findQuizById(quizId);

      if (!data) {
        throw new APIError(404, "Quiz not found");
      }

      if (data.status === "inactive") {
        throw new APIError(400, "Quiz is inactive");
      }

      // Populate the questions data before returning
      data = await quizRepo.populateQuizQuestions(data);
      console.log(data);

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
    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can update quiz");
    }

    const { quizId } = req.params;
    const { questionID, quizName, quizDescription } = req.body;

    try {
      const existingQuiz = await quizRepo.findQuizById(quizId);
      if (!existingQuiz) {
        throw new APIError(404, "Quiz not found");
      }

      const updateData = {
        lastEdited: Date.now(),
      };

      if (quizName) updateData.quizName = quizName;
      if (quizDescription) updateData.quizDescription = quizDescription;

      if (questionID) {
        console.log(
          "Existing questions:",
          existingQuiz.questions.map((q) => q._id.toString())
        );
        console.log("New question:", questionID);

        const questionExists = existingQuiz.questions.some(
          (question) => question._id.toString() === questionID
        );

        if (questionExists) {
          throw new APIError(400, "Question already exists in the quiz");
        }

        updateData.questionID = questionID;
      }

      const updatedQuiz = await quizRepo.updateQuiz(quizId, updateData);

      return {
        success: true,
        quiz: updatedQuiz,
      };
    } catch (error) {
      console.error("Update quiz error:", error);
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

    const { quizId } = req.body;

    if (!quizId) {
      throw new APIError(400, "Quiz ID is required");
    }

    try {
      const quiz = await quizRepo.findQuizById(quizId);
      if (!quiz) {
        throw new APIError(404, "Quiz not found");
      }

      const deletedQuiz = await quizRepo.updateQuizStatus(quizId, "inactive");

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

  async activateQuiz(req) {
    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can activate quiz");
    }

    const { quizId } = req.body;
    if (!quizId) {
      throw new APIError(400, "Quiz ID is required");
    }

    try {
      const quiz = await quizRepo.findQuizById(quizId);
      if (!quiz) {
        throw new APIError(404, "Quiz not found");
      }

      const activatedQuiz = await quizRepo.updateQuizStatus(quizId, "active");

      return {
        success: true,
        message: "Quiz activated successfully",
        quiz: activatedQuiz,
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
