const QUESTIONS = require("../models/question.model");
const QUESTION_BANK = require("../models/questionBank.model");
const TOPIC = require("../models/topic.model");

class QuestionsRepository {
  async findAllQuestions() {
    return await QUESTIONS.find();
  }

  async findQuestionById(questionId) {
    return await QUESTIONS.findById(questionId);
  }

  async findQuestionsByTopic(topicId) {
    return await QUESTIONS.find({ topic: topicId });
  }

  async createQuestion(questionData) {
    return await QUESTIONS.create(questionData);
  }

  async updateQuestionContent(questionId, questionContent) {
    return await QUESTIONS.findByIdAndUpdate(
      questionId,
      { questionContent },
      { new: true }
    );
  }

  async updateQuestionStatus(questionId, status) {
    return await QUESTIONS.findByIdAndUpdate(
      questionId,
      { status },
      { new: true }
    );
  }

  // QuestionBank related operations
  async findQuestionBankByName(name) {
    return await QUESTION_BANK.findOne({ name });
  }

  async createQuestionBank(bankData) {
    return await QUESTION_BANK.create(bankData);
  }

  async findAllQuestionBanks() {
    return await QUESTION_BANK.find().populate("questions");
  }

  async findQuestionBankById(bankId) {
    return await QUESTION_BANK.findById(bankId).populate("questions");
  }

  async updateQuestionBank(bankId, updateData) {
    return await QUESTION_BANK.findByIdAndUpdate(bankId, updateData, {
      new: true,
    });
  }

  async addQuestionToBank(bankId, questionId) {
    return await QUESTION_BANK.findByIdAndUpdate(
      bankId,
      {
        $push: { questions: questionId },
        lastEdited: Date.now(),
      },
      { new: true, runValidators: true }
    ).populate("questions");
  }

  async updateQuestionBankStatus(bankId, status) {
    return await QUESTION_BANK.findByIdAndUpdate(bankId, status, { new: true });
  }

  async removeQuestionFromBank(bankId, questionId) {
    return await QUESTION_BANK.findOneAndUpdate(
      { questions: questionId },
      {
        $pull: { questions: questionId },
      }
    );
  }

  // Topic related operations
  async findTopicByName(name) {
    return await TOPIC.findOne({ name });
  }

  async createTopic(topicData) {
    return await TOPIC.create(topicData);
  }
}

module.exports = new QuestionsRepository();
