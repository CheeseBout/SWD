const QUESTIONS = require("../models/question.model");
const QUESTION_BANK = require("../models/questionBank.model");
const TOPIC = require("../models/topic.model");
const APIError = require("../utils/ApiError");

class QuestionsBankService {
  //QuestionBank

  async createQuestionBank(req) {
    const requestBody = { ...req.body };

    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can create question bank");
    }

    //create if topic not exist
    const topic = await TOPIC.findOne({ name: requestBody.topic });
    if (!topic) {
      const newTopic = await TOPIC.create({
        name: requestBody.topicName,
        description: requestBody.topicDescription,
      });
      requestBody.topic = newTopic._id;
    } else {
      requestBody.topic = topic._id;
    }

    const data = await QUESTION_BANK.findOne({
      name: requestBody.questionBankName,
    });
    if (data) {
      throw new APIError(400, "Question bank already exist");
    }
    const questionBank = await QUESTION_BANK.create(requestBody);

    return {
      data: {
        questionBank,
        topic,
      },
    };
  }

  async getAllQuestionBanks() {
    const data = await QUESTION_BANK.find();
    return { data };
  }

  async getQuestionBankById(questionBankId) {
    const data = await QUESTION_BANK.findById(questionBankId).populate(
      "questions"
    );
    if (!data) {
      throw new APIError(400, "Question Bank not found");
    }
    return { data };
  }

  async updateQuestionBank(req) {
    const questionBankId = req.params.questionBankId;
    console.log("questionBankId", questionBankId);
    const questionBank = await QUESTION_BANK.findById(questionBankId);
    if (!questionBank) {
      throw new APIError(400, "Question Bank not found");
    }

    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can update question bank");
    }

    const { questionBankName, description } = req.body;

    const updatedQuestionBank = await QUESTION_BANK.findByIdAndUpdate(
      questionBankId,
      { questionBankName, description },
      {
        new: true,
      }
    );
    return { updatedQuestionBank };
  }

  async deleteQuestionBank(req) {
    const questionBankId = req.params.questionBankId;
    const questionBank = await QUESTION_BANK.findById(questionBankId);
    if (!questionBank) {
      throw new APIError(400, "Question Bank not found");
    }

    try {
      // Update question status to inactive instead of deleting
      await QUESTION_BANK.findByIdAndUpdate(
        questionBankId,
        { status: "inactive" },
        { new: true }
      );

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

  //Questions
  async getAllQuestions() {
    const data = await QUESTIONS.find();
    return { data };
  }

  async getQuestionById(questionId) {
    console.log("questionId", questionId);
    const data = await QUESTIONS.findById(questionId);
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
      // Check if question bank exists
      const existingBank = await QUESTION_BANK.findById(
        requestBody.questionBank
      );
      if (!existingBank) {
        throw new APIError(404, "Question Bank not found");
      }

      const newQuestion = await QUESTIONS.create({
        questionContent: requestBody.questionContent,
        questionBank: requestBody.questionBank,
      });

      // Update QuestionBank with the new question
      const updatedQuestionBank = await QUESTION_BANK.findByIdAndUpdate(
        requestBody.questionBank,
        {
          $push: { questions: newQuestion._id },
          lastEdited: Date.now(),
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate("questions");

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
    const { questionContent } = req.body; // Only extract questionContent

    if (!questionContent) {
      throw new APIError(400, "Question content is required");
    }

    const question = await QUESTIONS.findById(questionId);
    if (!question) {
      throw new APIError(400, "Question not found");
    }

    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can update questions");
    }

    const updatedQuestion = await QUESTIONS.findByIdAndUpdate(
      questionId,
      { questionContent }, // Only update questionContent
      {
        new: true,
      }
    );
    return { updatedQuestion };
  }

  async deleteQuestion(req) {
    const questionId = req.params.questionId;
    console.log("questionId", questionId);
    const question = await QUESTIONS.findById(questionId);

    if (!question) {
      throw new APIError(400, "Question not found");
    }

    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can delete questions");
    }

    try {
      // Update question status to inactive instead of deleting
      const updatedQuestion = await QUESTIONS.findByIdAndUpdate(
        questionId,
        { status: "inactive" },
        { new: true }
      );

      // Update question bank to remove reference to this question
      await QUESTION_BANK.findOneAndUpdate(
        { questions: questionId },
        {
          $pull: { questions: questionId },
        }
      );

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
    const data = await QUESTIONS.find({ topic: topicId });
    return { data };
  }
}

module.exports = new QuestionsBankService();
