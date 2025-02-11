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
      // Kiểm tra question tồn tại
      const question = await QUESTIONS.findById(questionID);
      if (!question) {
        throw new APIError(404, "Question not found");
      }

      if (question.options.length >= 4) {
        throw new APIError(400, "Question already has 4 options");
      }

      // Cập nhật trực tiếp options vào question
      const updatedQuestion = await QUESTIONS.findByIdAndUpdate(
        questionID,
        {
          $set: { options: options },
          lastEdited: Date.now(),
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate("options");

      return { data: updatedQuestion };
    } catch (error) {
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid question ID format");
      }
      throw error;
    }
  }

  async updateOptions(req) {
    const optionId = req.params.optionId;
    const option = await OPTIONS.findById(optionId);

    if (!option) {
      throw new APIError(400, "Option not found");
    }
    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can update options");
    }
    const requestBody = { ...req.body };
    const updatedOption = await OPTIONS.findByIdAndUpdate(
      optionId,
      requestBody,
      {
        new: true,
      }
    );
    return { updatedOption };
  }

  async deleteOptions(optionId) {
    const option = await OPTIONS.findById(optionId);
    if (!option) {
      throw new APIError(400, "Option not found");
    }
    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can delete options");
    }

    await OPTIONS.findByIdAndDelete(optionId);
  }
}

module.exports = new OptionsServices();
