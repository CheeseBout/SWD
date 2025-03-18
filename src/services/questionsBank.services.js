const APIError = require("../utils/ApiError");
const questionsRepo = require("../repositories/questions.repo");
const optionsRepo = require("../repositories/options.repo");

class QuestionsBankService {
  async createQuestionBank(req) {
    console.log("req.user", req.user);
    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can create question bank");
    }

    const requestBody = { ...req.body };

    const topic = await questionsRepo.findTopicByName(requestBody.topic);
    if (!topic) {
      const newTopic = await questionsRepo.createTopic({
        name: requestBody.topicName,
        description: requestBody.topicDescription,
        imageUrl: requestBody.imageUrl,
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
    const { questionBankId, questionBankName, description } = req.body;

    if (!questionBankId) {
      throw new APIError(400, "Question Bank ID is required");
    }

    const questionBank = await questionsRepo.findQuestionBankById(
      questionBankId
    );
    if (!questionBank) {
      throw new APIError(400, "Question Bank not found");
    }

    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can update question bank");
    }

    const updateData = {};
    if (questionBankName) updateData.questionBankName = questionBankName;
    if (description) updateData.description = description;
    updateData.lastEdited = Date.now();

    const updatedQuestionBank = await questionsRepo.updateQuestionBank(
      questionBankId,
      updateData
    );
    return { updatedQuestionBank };
  }

  async enableQuestionBank(req) {
    const questionBankId = req.params.questionBankId;
    const questionBank = await questionsRepo.findQuestionBankById(
      questionBankId
    );
    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can enable question bank");
    }
    if (!questionBank) {
      throw new APIError(400, "Question Bank not found");
    }
    try {
      await questionsRepo.updateQuestionBankStatus(questionBankId, {
        status: "active",
      });
      return {
        message: "Question bank enable successfully",
      };
    } catch (error) {
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid ID format");
      }
      throw error;
    }
  }

  async deleteQuestionBank(req) {
    const { questionBankId } = req.body;

    if (!questionBankId) {
      throw new APIError(400, "Question Bank ID is required");
    }

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
        message: "Question bank deleted successfully",
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
    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can create questions");
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

      const newOptions = await optionsRepo.createOption({
        questionID: newQuestion._id,
        options: requestBody.options,
      });

      console.log("New options", newOptions);

      //push new options to options in the questions object
      await questionsRepo.updateQuestionOptions(newQuestion._id, {
        options: newOptions.options,
      });

      const updatedQuestionBank = await questionsRepo.addQuestionToBank(
        requestBody.questionBank,
        newQuestion._id
      );

      return {
        data: newQuestion,
        questionBank: updatedQuestionBank,
        options: newOptions,
      };
    } catch (error) {
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid question bank ID format");
      }
      throw error;
    }
  }

  async updateQuestion(req) {
    const { questionId, questionContent } = req.body;

    if (!questionId) {
      throw new APIError(400, "Question ID is required");
    }

    if (!questionContent) {
      throw new APIError(400, "Question content is required");
    }

    const question = await questionsRepo.findQuestionById(questionId);
    if (!question) {
      throw new APIError(400, "Question not found");
    }

    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can update questions");
    }

    const updatedQuestion = await questionsRepo.updateQuestion(questionId, {
      questionContent,
    });
    return { updatedQuestion };
  }

  async enableQuestion(req) {
    const questionId = req.params.questionId;
    const question = await questionsRepo.findQuestionById(questionId);

    if (!question) {
      throw new APIError(400, "Question not found");
    }

    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can enable questions");
    }

    const updatedQuestion = await questionsRepo.updateQuestionStatus(
      questionId,
      { status: "active" }
    );
    return { updatedQuestion };
  }

  async deleteQuestion(req) {
    const questionId = req.params.questionId;
    console.log("questionId", questionId);
    const question = await questionsRepo.findQuestionById(questionId);

    if (!question) {
      throw new APIError(400, "Question not found");
    }

    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can delete questions");
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

  async activateQuestion(req) {
    const { questionId } = req.body;
    if (!questionId) {
      throw new APIError(400, "Question ID is required");
    }

    const question = await questionsRepo.findQuestionById(questionId);
    if (!question) {
      throw new APIError(400, "Question not found");
    }

    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can activate questions");
    }

    try {
      const activatedQuestion = await questionsRepo.updateQuestionStatus(
        questionId,
        {
          status: "active",
        }
      );

      // Also activate the question in its bank if it exists
      if (question.questionBank) {
        await questionsRepo.updateQuestionStatusInBank(
          questionId,
          question.questionBank,
          "active"
        );
      }

      return {
        success: true,
        message: "Question activated successfully",
        data: activatedQuestion,
      };
    } catch (error) {
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid ID format");
      }
      throw error;
    }
  }

  async activateQuestionBank(req) {
    const { questionBankId } = req.body;
    if (!questionBankId) {
      throw new APIError(400, "Question Bank ID is required");
    }

    const questionBank = await questionsRepo.findQuestionBankById(
      questionBankId
    );
    if (!questionBank) {
      throw new APIError(400, "Question Bank not found");
    }

    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can activate question banks");
    }

    try {
      const activatedBank = await questionsRepo.updateQuestionBankStatus(
        questionBankId,
        {
          status: "active",
        }
      );

      return {
        success: true,
        message: "Question bank activated successfully",
        data: activatedBank,
      };
    } catch (error) {
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid ID format");
      }
      throw error;
    }
  }
}

module.exports = new QuestionsBankService();
