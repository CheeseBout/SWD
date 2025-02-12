const quizServices = require("../services/quiz.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class QuizController {
  getAllQuizzes = catchAsync(async (req, res) => {
    return OK(res, "Success", await quizServices.getAllQuiz());
  });

  getQuizById = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await quizServices.getQuizById(req.params.quizId)
    );
  });

  createQuiz = catchAsync(async (req, res) => {
    return OK(res, "Success", await quizServices.createQuiz(req));
  });

  updateQuiz = catchAsync(async (req, res) => {
    return OK(res, "Success", await quizServices.updateQuiz(req));
  });

  deleteQuiz = catchAsync(async (req, res) => {
    return OK(res, "Success", await quizServices.deleteQuiz(req.params.quizId));
  });

  getQuizQuestions = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await quizServices.getQuizQuestions(req.params.quizId)
    );
  });
}

module.exports = new QuizController();
