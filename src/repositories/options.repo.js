const OPTIONS = require("../models/options.model");
const QUESTIONS = require("../models/question.model");
const QUIZZES = require("../models/quizzes.model");
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

  async createCombinedUserAnswer(answerData) {
    const data = {
      userID: answerData.userID,
      totalScore: answerData.totalScore,
      selections: answerData.selections,
    };

    // Only add quizID if it's provided
    if (answerData.quizID) {
      data.quizID = answerData.quizID;
    }

    return await USER_ANSWERS.create(data);
  }

  async updateQuestionUserAnswers(questionId, userAnswerId) {
    return await QUESTIONS.findByIdAndUpdate(
      questionId,
      {
        $addToSet: { userAnswers: userAnswerId },
      },
      { new: true }
    );
  }

  async updateQuestionOptionUserAnswers(questionId, optionId, userAnswerId) {
    return await QUESTIONS.findOneAndUpdate(
      {
        _id: questionId,
        "options._id": optionId,
      },
      {
        $addToSet: { "options.$.userAnswers": userAnswerId },
      },
      { new: true }
    );
  }

  async updateOptionUserAnswers(questionId, optionId, userAnswerId) {
    return await OPTIONS.findOneAndUpdate(
      {
        questionID: questionId,
        "options._id": optionId,
      },
      {
        $addToSet: { "options.$.userAnswers": userAnswerId },
      },
      { new: true }
    );
  }

  async findOptionsByQuestionId(questionId) {
    return await OPTIONS.findOne({ questionID: questionId });
  }

  async findQuestionWithQuiz(questionId) {
    return await QUESTIONS.findById(questionId).populate("quizzes");
  }

  async updateQuizUserAnswers(quizId, userAnswerId) {
    if (!quizId) return null;

    try {
      // Check if the quiz exists first
      const quiz = await QUIZZES.findById(quizId);
      if (!quiz) {
        console.error(`Quiz with ID ${quizId} not found`);
        return null;
      }

      // Update the userAnswers array
      const updatedQuiz = await QUIZZES.findByIdAndUpdate(
        quizId,
        { $push: { userAnswer: userAnswerId } },
        { new: true }
      );

      console.log("Update result:", result);

      // Verify the update worked by fetching the updated quiz
      await QUIZZES.findById(quizId);
      console.log("After update, quiz userAnswer:", updatedQuiz.userAnswer);

      return updatedQuiz;
    } catch (error) {
      console.error(
        `Error updating quiz ${quizId} with user answer ${userAnswerId}:`,
        error
      );
      throw error;
    }
  }

  async findQuizByQuestionId(questionId) {
    const question = await QUESTIONS.findById(questionId);
    if (!question || !question.quizzes || question.quizzes.length === 0) {
      return null;
    }
    return question.quizzes[0];
  }

  async getQuizDetails(quizId) {
    return await QUIZZES.findById(quizId).lean();
  }
}

module.exports = new OptionsRepository();

module.exports = new OptionsRepository();
