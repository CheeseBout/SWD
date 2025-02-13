const { options } = require("joi");
const OPTIONS = require("../models/options.model");
const QUESTIONS = require("../models/question.model");
const APIError = require("../utils/ApiError");
const mongoose = require("mongoose");
const USER_ANSWERS = require("../models/userAnswer.model");

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
    const selections = Array.isArray(req.body) ? req.body : [req.body];
    const userID = req.user._id;

    try {
      // Validate tất cả ID trước khi xử lý
      selections.forEach((selection) => {
        if (
          !mongoose.Types.ObjectId.isValid(selection.optionID) ||
          !mongoose.Types.ObjectId.isValid(selection.questionID)
        ) {
          throw new APIError(400, "Invalid option ID or question ID format");
        }
      });

      const results = await Promise.all(
        selections.map(async (selection) => {
          try {
            return await this.processOptionSelection(
              selection.optionID,
              selection.questionID,
              userID
            );
          } catch (error) {
            return {
              optionID: selection.optionID,
              questionID: selection.questionID,
              error: error.message,
            };
          }
        })
      );

      // Tính tổng score từ tất cả các lựa chọn
      const totalScore = results.reduce((sum, result) => {
        return sum + (result.score || 0);
      }, 0);

      return {
        success: true,
        data: results,
        totalScore: totalScore,
      };
    } catch (error) {
      throw new APIError(400, error.message);
    }
  }

  async processOptionSelection(optionID, questionID, userID) {
    try {
      const question = await QUESTIONS.findById(questionID);
      if (!question) {
        throw new APIError(404, `Question not found: ${questionID}`);
      }

      // Get the options document
      const optionsDoc = await OPTIONS.findOne({ questionID: questionID });
      if (!optionsDoc) {
        throw new APIError(404, "Options not found");
      }

      // Lấy mảng options từ document
      const optionsArray = optionsDoc.options || [];

      // Tìm option được chọn
      const selectedOption = optionsArray.find(
        (opt) => opt._id.toString() === optionID
      );

      if (!selectedOption) {
        throw new APIError(404, `Option not found: ${optionID}`);
      }

      // Calculate total score
      const totalScore = selectedOption.score || 0;

      // Create new user answer
      const userAnswer = await USER_ANSWERS.create({
        userID,
        questionID,
        optionID,
        totalScore,
        quizID: question.quizzes[0],
      });

      // Update references
      await Promise.all([
        // Update question reference
        QUESTIONS.findByIdAndUpdate(questionID, {
          $addToSet: { userAnswers: userAnswer._id },
        }),

        // Update option reference
        OPTIONS.findOneAndUpdate(
          {
            questionID: questionID,
            "options._id": optionID,
          },
          {
            $addToSet: { "options.$.userAnswers": userAnswer._id },
          }
        ),
      ]);

      return {
        optionID,
        questionID,
        score: selectedOption.score,
        optionContent: selectedOption.optionContent,
        selectedAt: userAnswer.createdAt,
        userAnswerId: userAnswer._id,
        success: true,
      };
    } catch (error) {
      console.error("Selection error:", error);
      throw new APIError(400, `Error processing selection: ${error.message}`);
    }
  }
}

module.exports = new OptionsServices();
