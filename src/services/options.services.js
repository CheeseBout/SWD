const APIError = require("../utils/ApiError");
const mongoose = require("mongoose");
const optionsRepo = require("../repositories/options.repo");

class OptionsServices {
  async getAllOptions() {
    const data = await optionsRepo.findAllWithQuestions();
    return { options: data };
  }

  async getOptionById(optionId) {
    const data = await optionsRepo.findByIdWithQuestion(optionId);
    if (!data) {
      throw new APIError(400, "Option not found");
    }
    return { option: data };
  }

  async createOptions(req) {
    console.log(req.user.role);
    if (req.user.role !== "admin" && req.user.role !== "couple_therapist") {
      throw new APIError(
        403,
        "Only admin and couple therapist can add options"
      );
    }

    const { options, questionID } = req.body;

    try {
      const question = await optionsRepo.findQuestionById(questionID);
      if (!question) {
        throw new APIError(404, "Question not found");
      }

      if (question.options.length >= 4) {
        throw new APIError(400, "Question already has 4 options");
      }

      const createdOption = await optionsRepo.createOption({
        questionID: questionID,
        options: options,
      });

      const updatedQuestion = await optionsRepo.updateQuestionOptions(
        questionID,
        {
          $set: {
            options: createdOption.options,
            lastEdited: Date.now(),
          },
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
    if (req.user.role !== "admin" && req.user.role !== "couple_therapist") {
      throw new APIError(403, "Only admin can update options");
    }

    const { optionID, questionID, optionContent, score } = req.body;

    try {
      const updatedOptions = await optionsRepo.updateOptionInOptions(
        questionID,
        optionID,
        {
          optionContent,
          score,
          lastEdited: Date.now(),
        }
      );

      if (!updatedOptions) {
        throw new APIError(404, "Option not found");
      }

      await optionsRepo.updateOptionInQuestions(questionID, optionID, {
        optionContent,
        score,
        lastEdited: Date.now(),
      });

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
    if (req.user.role !== "admin" && req.user.role !== "couple_therapist") {
      throw new APIError(403, "Only admin can delete options");
    }

    const { optionID, questionID } = req.body;

    try {
      const updatedOptions = await optionsRepo.deleteOptionFromOptions(
        questionID,
        optionID
      );

      if (!updatedOptions) {
        throw new APIError(404, "Option not found");
      }

      await optionsRepo.deleteOptionFromQuestions(questionID, optionID);

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
      const question = await optionsRepo.findQuestionById(questionID);
      if (!question) {
        throw new APIError(404, `Question not found: ${questionID}`);
      }

      const optionsDoc = await optionsRepo.findOptionsByQuestionId(questionID);
      if (!optionsDoc) {
        throw new APIError(404, "Options not found");
      }

      const optionsArray = optionsDoc.options || [];

      const selectedOption = optionsArray.find(
        (opt) => opt._id.toString() === optionID
      );

      if (!selectedOption) {
        throw new APIError(404, `Option not found: ${optionID}`);
      }

      const totalScore = selectedOption.score || 0;

      const userAnswer = await optionsRepo.createUserAnswer({
        userID,
        questionID,
        optionID,
        totalScore,
        quizID: question.quizzes[0],
      });

      await Promise.all([
        optionsRepo.updateQuestionUserAnswers(questionID, userAnswer._id),
        optionsRepo.updateOptionUserAnswers(
          questionID,
          optionID,
          userAnswer._id
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
