const APIError = require("../utils/ApiError");
const questionsRepo = require("../repositories/questions.repo");

class QuestionsBankService {
  async createQuestionBank(req) {
    console.log("req.user", req.user);
    if (req.user.role !== "admin" && req.user.role !== "couple_therapist") {
      throw new APIError(
        403,
        "Only admin and couple therapist can create question bank"
      );
    }

    const requestBody = { ...req.body };

    const topic = await questionsRepo.findTopicByName(requestBody.topic);
    if (!topic) {
      const newTopic = await questionsRepo.createTopic({
        name: requestBody.topicName,
        description: requestBody.topicDescription,
      });
      requestBody.topic = newTopic._id;
    } else {
      requestBody.topic = topic._id;
    }

    const existingBank = await questionsRepo.findQuestionBankByName(
      requestBody.questionBankName
    );
    if (existingBank) {
      throw new APIError(400, "Question bank already exist");
    }

    const questionBank = await questionsRepo.createQuestionBank(requestBody);

    return {
      data: {
        questionBank,
        topic,
      },
    };
  }

  async getAllQuestionBanks() {
    const data = await questionsRepo.findAllQuestionBanks();
    return { data };
  }

  async getQuestionBankById(questionBankId) {
    const data = await questionsRepo.findQuestionBankById(questionBankId);
    if (!data) {
      throw new APIError(400, "Question Bank not found");
    }
    return { data };
  }

  async updateQuestionBank(req) {
    const questionBankId = req.params.questionBankId;
    console.log("questionBankId", questionBankId);
    const questionBank = await questionsRepo.findQuestionBankById(
      questionBankId
    );
    if (!questionBank) {
      throw new APIError(400, "Question Bank not found");
    }

    if (req.user.role !== "admin" && req.user.role !== "couple_therapist") {
      throw new APIError(
        403,
        "Only admin and couple therapist can update question bank"
      );
    }

    const { questionBankName, description } = req.body;

    const updatedQuestionBank = await questionsRepo.updateQuestionBank(
      questionBankId,
      { questionBankName, description }
    );
    return { updatedQuestionBank };
  }

  async deleteQuestionBank(req) {
    const questionBankId = req.params.questionBankId;
    const questionBank = await questionsRepo.findQuestionBankById(
      questionBankId
    );
    if (!questionBank) {
      throw new APIError(400, "Question Bank not found");
    }

    try {
      await questionsRepo.updateQuestionBankStatus(questionBankId, {
        status: "inactive",
      });

      return {
        message: "Question deleted successfully",
      };
    } catch (error) {
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid ID format");
      }
      throw error;
    }
  }

  async getAllQuestions() {
    const data = await questionsRepo.findAllQuestions();
    return { data };
  }

  async getQuestionById(questionId) {
    console.log("questionId", questionId);
    const data = await questionsRepo.findQuestionById(questionId);
    console.log(data);
    if (!data) {
      throw new APIError(400, "Question not found");
    }
    return { data };
  }

  async createQuestion(req) {
    if (req.user.role !== "admin" && req.user.role !== "couple_therapist") {
      throw new APIError(
        403,
        "Only admin and couple therapist can create questions"
      );
    }

    const requestBody = { ...req.body };

    try {
      const existingBank = await questionsRepo.findQuestionBankById(
        requestBody.questionBank
      );
      if (!existingBank) {
        throw new APIError(404, "Question Bank not found");
      }

      const newQuestion = await questionsRepo.createQuestion({
        questionContent: requestBody.questionContent,
        questionBank: requestBody.questionBank,
      });

      const updatedQuestionBank = await questionsRepo.addQuestionToBank(
        requestBody.questionBank,
        newQuestion._id
      );

      return {
        data: newQuestion,
        questionBank: updatedQuestionBank,
      };
    } catch (error) {
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid question bank ID format");
      }
      throw error;
    }
  }

  async updateQuestion(req) {
    const questionId = req.params.questionId;
    const { questionContent } = req.body;

    if (!questionContent) {
      throw new APIError(400, "Question content is required");
    }

    const question = await questionsRepo.findQuestionById(questionId);
    if (!question) {
      throw new APIError(400, "Question not found");
    }

    if (req.user.role !== "admin" && req.user.role !== "couple_therapist") {
      throw new APIError(
        403,
        "Only admin and couple therapist can update questions"
      );
    }

    const updatedQuestion = await questionsRepo.updateQuestion(questionId, {
      questionContent,
    });
    return { updatedQuestion };
  }

  async deleteQuestion(req) {
    const questionId = req.params.questionId;
    console.log("questionId", questionId);
    const question = await questionsRepo.findQuestionById(questionId);

    if (!question) {
      throw new APIError(400, "Question not found");
    }

    if (req.user.role !== "admin" && req.user.role !== "couple_therapist") {
      throw new APIError(
        403,
        "Only admin and couple therapist can delete questions"
      );
    }

    try {
      await questionsRepo.updateQuestionStatus(questionId, {
        status: "inactive",
      });

      await questionsRepo.removeQuestionFromBank(questionId);

      return {
        message: "Question deleted successfully",
      };
    } catch (error) {
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid ID format");
      }
      throw error;
    }
  }

  async getQuestionByTopic(topicId) {
    const data = await questionsRepo.findQuestionsByTopic(topicId);
    return { data };
  }
}

module.exports = new QuestionsBankService();
