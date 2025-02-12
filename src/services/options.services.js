const { options } = require("joi");
const OPTIONS = require("../models/options.model");
const QUESTIONS = require("../models/question.model");
const APIError = require("../utils/ApiError");

class OptionsServices {
  async getAllOptions() {
    const data = await OPTIONS.find().populate("questionID");
    return { data };
  }

  async getOptionById(optionId) {
    const data = await OPTIONS.findById(optionId).populate("questionID");
    if (!data) {
      throw new APIError(400, "Option not found");
    }
    return { data };
  }

  async createOptions(req) {
    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can add options");
    }

    const { options, questionID } = req.body;

    try {
      const question = await QUESTIONS.findById(questionID);
      if (!question) {
        throw new APIError(404, "Question not found");
      }

      if (question.options.length >= 4) {
        throw new APIError(400, "Question already has 4 options");
      }

      // Tạo một document options mới
      const createdOption = await OPTIONS.create({
        questionID: questionID,
        options: options,
      });

      // Cập nhật question với cùng các options đã tạo
      const updatedQuestion = await QUESTIONS.findByIdAndUpdate(
        questionID,
        {
          $set: {
            options: createdOption.options,
            lastEdited: Date.now(),
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      return {
        data: {
          question: updatedQuestion,
          options: createdOption,
        },
      };
    } catch (error) {
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid question ID format");
      }
      throw error;
    }
  }

  async updateOptions(req) {
    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can update options");
    }

    const { optionID, questionID, optionContent, score } = req.body;

    try {
      // Tìm và cập nhật option trong OPTIONS collection
      const updatedOptions = await OPTIONS.findOneAndUpdate(
        {
          questionID: questionID,
          "options._id": optionID,
        },
        {
          $set: {
            "options.$.optionContent": optionContent,
            "options.$.score": score,
            lastEdited: Date.now(),
          },
        },
        { new: true }
      );

      if (!updatedOptions) {
        throw new APIError(404, "Option not found");
      }

      // Đồng bộ cập nhật trong QUESTIONS collection
      await QUESTIONS.findOneAndUpdate(
        {
          _id: questionID,
          "options._id": optionID,
        },
        {
          $set: {
            "options.$.optionContent": optionContent,
            "options.$.score": score,
            lastEdited: Date.now(),
          },
        },
        { new: true }
      );

      return {
        data: {
          options: updatedOptions,
        },
      };
    } catch (error) {
      console.error("Update error:", error);
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid ID format");
      }
      throw error;
    }
  }

  async deleteOptions(req) {
    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can delete options");
    }

    const { optionID, questionID } = req.body;

    try {
      const updatedOptions = await OPTIONS.findOneAndUpdate(
        { questionID: questionID },
        {
          $pull: {
            options: { _id: optionID },
          },
        },
        { new: true }
      );

      if (!updatedOptions) {
        throw new APIError(404, "Option not found");
      }

      // Đồng bộ xóa option trong QUESTIONS collection
      await QUESTIONS.findByIdAndUpdate(questionID, {
        $pull: {
          options: { _id: optionID },
        },
      });

      return {
        message: "Option deleted successfully",
        data: updatedOptions,
      };
    } catch (error) {
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid ID format");
      }
      throw error;
    }
  }

  async selectOption(req) {
    const { optionID, questionID } = req.body;
    const userID = req.user._id;

    try {
      console.log(optionID, questionID, userID);
      const option = await OPTIONS.findById(optionID);
      if (!option) {
        throw new APIError(404, "Option not found");
      }

      const question = await QUESTIONS.findById(questionID);
      if (!question) {
        throw new APIError(404, "Question not found");
      }

      // Find the question and update its options array to include the user answer
      const updatedQuestion = await QUESTIONS.findOneAndUpdate(
        { _id: questionID, "options._id": optionID },
        {
          $push: {
            "options.$.userAnswers": {
              userID,
              questionID,
              quizID,
              selectedAt: Date.now(),
            },
          },
        },
        { new: true }
      );

      if (!updatedQuestion) {
        throw new APIError(404, "Question or option not found");
      }

      const userAnswer = updatedQuestion.options
        .find((opt) => opt._id.toString() === optionID)
        .userAnswers.slice(-1)[0];

      return {
        success: true,
        data: {
          userAnswer,
        },
      };
    } catch (error) {
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid ID format");
      }
      throw error;
    }
  }
}

module.exports = new OptionsServices();
