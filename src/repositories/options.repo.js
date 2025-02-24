const OPTIONS = require("../models/options.model");
const QUESTIONS = require("../models/question.model");
const USER_ANSWERS = require("../models/userAnswer.model");

class OptionsRepository {
  async findAllWithQuestions() {
    return await OPTIONS.find().populate("questionID");
  }

  async findByIdWithQuestion(optionId) {
    return await OPTIONS.findById(optionId).populate("questionID");
  }

  async findQuestionById(questionId) {
    return await QUESTIONS.findById(questionId);
  }

  async createOption(optionData) {
    return await OPTIONS.create(optionData);
  }

  async updateQuestionOptions(questionId, updateData) {
    return await QUESTIONS.findByIdAndUpdate(questionId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async updateOptionInOptions(questionId, optionId, updateData) {
    return await OPTIONS.findOneAndUpdate(
      {
        questionID: questionId,
        "options._id": optionId,
      },
      {
        $set: {
          "options.$.optionContent": updateData.optionContent,
          "options.$.score": updateData.score,
          lastEdited: Date.now(),
        },
      },
      { new: true }
    );
  }

  async updateOptionInQuestions(questionId, optionId, updateData) {
    return await QUESTIONS.findOneAndUpdate(
      {
        _id: questionId,
        "options._id": optionId,
      },
      {
        $set: {
          "options.$.optionContent": updateData.optionContent,
          "options.$.score": updateData.score,
          lastEdited: Date.now(),
        },
      },
      { new: true }
    );
  }

  async deleteOptionFromOptions(questionId, optionId) {
    return await OPTIONS.findOneAndUpdate(
      { questionID: questionId },
      {
        $pull: {
          options: { _id: optionId },
        },
      },
      { new: true }
    );
  }

  async deleteOptionFromQuestions(questionId, optionId) {
    return await QUESTIONS.findByIdAndUpdate(questionId, {
      $pull: {
        options: { _id: optionId },
      },
    });
  }

  async createUserAnswer(answerData) {
    return await USER_ANSWERS.create(answerData);
  }

  async updateQuestionUserAnswers(questionId, userAnswerId) {
    return await QUESTIONS.findByIdAndUpdate(questionId, {
      $addToSet: { userAnswers: userAnswerId },
    });
  }

  async updateOptionUserAnswers(questionId, optionId, userAnswerId) {
    return await OPTIONS.findOneAndUpdate(
      {
        questionID: questionId,
        "options._id": optionId,
      },
      {
        $addToSet: { "options.$.userAnswers": userAnswerId },
      }
    );
  }
}

module.exports = new OptionsRepository();
