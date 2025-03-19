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
    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can add options");
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
    if (req.user.role !== "admin") {
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
    if (req.user.role !== "admin") {
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

      // Process all selections to collect data without saving individual answers
      const selectionDetails = await Promise.all(
        selections.map(async (selection) => {
          try {
            const { optionID, questionID } = selection;
            const question = await optionsRepo.findQuestionById(questionID);

            if (!question) {
              throw new APIError(404, `Question not found: ${questionID}`);
            }

            // Get the quiz ID for this question
            const quizId =
              question.quizzes && question.quizzes.length > 0
                ? question.quizzes[0]
                : null;

            const optionsDoc = await optionsRepo.findOptionsByQuestionId(
              questionID
            );
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

            // Return details without saving individual answers
            return {
              optionID,
              questionID,
              score: selectedOption.score || 0,
              optionContent: selectedOption.optionContent,
              quizId: quizId, // Store the quiz ID for later use
            };
          } catch (error) {
            return {
              optionID: selection.optionID,
              questionID: selection.questionID,
              error: error.message,
              score: 0,
            };
          }
        })
      );

      // Calculate total score
      const totalScore = selectionDetails.reduce((sum, result) => {
        return sum + (result.score || 0);
      }, 0);

      const validSelections = selectionDetails.filter((item) => !item.error);

      if (validSelections.length === 0) {
        throw new APIError(400, "No valid selections provided");
      }

      // Save a single user answer document with all selections
      const savedUserAnswer = await optionsRepo.createCombinedUserAnswer({
        userID,
        totalScore,
        selections: validSelections.map((item) => ({
          questionID: item.questionID,
          optionID: item.optionID,
          score: item.score,
        })),
      });

      // Collect unique quiz IDs for updating
      const quizIds = [
        ...new Set(
          validSelections
            .filter((item) => item.quizId)
            .map((item) => item.quizId.toString())
        ),
      ];

      // Update all related questions and options with the single user answer ID
      for (const item of validSelections) {
        try {
          // Update the question's userAnswers array
          await optionsRepo.updateQuestionUserAnswers(
            item.questionID,
            savedUserAnswer._id
          );

          // Update the question's option userAnswers array separately
          await optionsRepo.updateQuestionOptionUserAnswers(
            item.questionID,
            item.optionID,
            savedUserAnswer._id
          );

          // Update the option's userAnswers array in the options collection
          await optionsRepo.updateOptionUserAnswers(
            item.questionID,
            item.optionID,
            savedUserAnswer._id
          );
        } catch (error) {
          console.error(
            `Error updating selections for question ${item.questionID}, option ${item.optionID}:`,
            error.message
          );
        }
      }

      // Update all related quizzes
      for (const quizId of quizIds) {
        try {
          await optionsRepo.updateQuizUserAnswers(quizId, savedUserAnswer._id);
        } catch (error) {
          console.error(`Error updating quiz ${quizId}:`, error.message);
        }
      }

      return {
        success: true,
        data: {
          userAnswerID: savedUserAnswer._id,
          selections: validSelections,
          totalScore: totalScore,
          createdAt: savedUserAnswer.createdAt,
          quizIds: quizIds.length > 0 ? quizIds : undefined,
        },
      };
    } catch (error) {
      throw new APIError(400, error.message);
    }
  }

  async selectOptionWithQuiz(req) {
    const selections = Array.isArray(req.body) ? req.body : [req.body];
    const userID = req.user._id;
    const quizID = req.params.quizID;

    // Validate the quizID
    if (!mongoose.Types.ObjectId.isValid(quizID)) {
      throw new APIError(400, "Invalid quiz ID format");
    }

    try {
      // Check the current state of the quiz before updates
      const quizBefore = await optionsRepo.getQuizDetails(quizID);
      console.log("Quiz before update:", JSON.stringify(quizBefore));

      selections.forEach((selection) => {
        if (
          !mongoose.Types.ObjectId.isValid(selection.optionID) ||
          !mongoose.Types.ObjectId.isValid(selection.questionID)
        ) {
          throw new APIError(400, "Invalid option ID or question ID format");
        }
      });

      // Process all selections to collect data without saving individual answers
      const selectionDetails = await Promise.all(
        selections.map(async (selection) => {
          try {
            const { optionID, questionID } = selection;
            const question = await optionsRepo.findQuestionById(questionID);

            if (!question) {
              throw new APIError(404, `Question not found: ${questionID}`);
            }

            const optionsDoc = await optionsRepo.findOptionsByQuestionId(
              questionID
            );
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

            // Return details without saving individual answers
            return {
              optionID,
              questionID,
              score: selectedOption.score || 0,
              optionContent: selectedOption.optionContent,
            };
          } catch (error) {
            return {
              optionID: selection.optionID,
              questionID: selection.questionID,
              error: error.message,
              score: 0,
            };
          }
        })
      );

      // Calculate total score
      const totalScore = selectionDetails.reduce((sum, result) => {
        return sum + (result.score || 0);
      }, 0);

      const validSelections = selectionDetails.filter((item) => !item.error);

      if (validSelections.length === 0) {
        throw new APIError(400, "No valid selections provided");
      }

      // Save a single user answer document with all selections, including the quizID from params
      const savedUserAnswer = await optionsRepo.createCombinedUserAnswer({
        userID,
        totalScore,
        quizID, // Use the quizID from params
        selections: validSelections.map((item) => ({
          questionID: item.questionID,
          optionID: item.optionID,
          score: item.score,
        })),
      });

      // Update all related questions and options with the single user answer ID
      for (const item of validSelections) {
        try {
          // Update the question's userAnswers array
          await optionsRepo.updateQuestionUserAnswers(
            item.questionID,
            savedUserAnswer._id
          );

          // Update the question's option userAnswers array separately
          await optionsRepo.updateQuestionOptionUserAnswers(
            item.questionID,
            item.optionID,
            savedUserAnswer._id
          );

          // Update the option's userAnswers array in the options collection
          await optionsRepo.updateOptionUserAnswers(
            item.questionID,
            item.optionID,
            savedUserAnswer._id
          );
        } catch (error) {
          console.error(
            `Error updating selections for question ${item.questionID}, option ${item.optionID}:`,
            error.message
          );
        }
      }

      // Update the quiz with the user answer ID - make sure this works correctly
      let updatedQuiz = null;
      try {
        updatedQuiz = await optionsRepo.updateQuizUserAnswers(
          quizID,
          savedUserAnswer._id
        );

        if (!updatedQuiz) {
          console.error(
            `Failed to update quiz ${quizID} with user answer ${savedUserAnswer._id}`
          );
        } else {
          console.log(
            `Successfully updated quiz ${quizID}, user answers:`,
            updatedQuiz.userAnswer
          );
        }

        // Check the quiz after our update to verify it worked
        const quizAfter = await optionsRepo.getQuizDetails(quizID);
        console.log("Quiz after update:", JSON.stringify(quizAfter));
      } catch (error) {
        console.error(`Error updating quiz ${quizID}:`, error.message);
      }

      return {
        success: true,
        data: {
          userAnswerID: savedUserAnswer._id,
          selections: validSelections,
          totalScore: totalScore,
          createdAt: savedUserAnswer.createdAt,
          quizId: quizID,
          updatedQuiz: updatedQuiz
            ? {
                _id: updatedQuiz._id,
                userAnswer: updatedQuiz.userAnswer || [], // Return the updated user answers
              }
            : undefined,
        },
      };
    } catch (error) {
      throw new APIError(400, error.message);
    }
  }

  // Keep the processOptionSelection method for backward compatibility
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
