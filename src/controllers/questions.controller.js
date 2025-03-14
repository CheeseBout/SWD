const questionsBankServices = require("../services/questionsBank.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class QuestionsController {
  //QuestionsBank
  getAllQuestionsBank = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await questionsBankServices.getAllQuestionBanks()
    );
  });

  createQuestionsBank = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await questionsBankServices.createQuestionBank(req)
    );
  });

  updateQuestionsBank = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await questionsBankServices.updateQuestionBank(req)
    );
  });

  enableQuestionBank = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await questionsBankServices.enableQuestionBank(req)
    );
  });

  deleteQuestionsBank = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await questionsBankServices.deleteQuestionBank(req)
    );
  });

  activateQuestionBank = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await questionsBankServices.activateQuestionBank(req)
    );
  });

  //Questions
  getAllQuestions = catchAsync(async (req, res) => {
    return OK(res, "Success", await questionsBankServices.getAllQuestions());
  });

  getQuestionById = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await questionsBankServices.getQuestionById(req.params.questionId)
    );
  });

  createQuestion = catchAsync(async (req, res) => {
    return OK(res, "Success", await questionsBankServices.createQuestion(req));
  });

  updateQuestion = catchAsync(async (req, res) => {
    return OK(res, "Success", await questionsBankServices.updateQuestion(req));
  });

  deleteQuestion = catchAsync(async (req, res) => {
    return OK(res, "Success", await questionsBankServices.deleteQuestion(req));
  });

  activateQuestion = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await questionsBankServices.activateQuestion(req)
    );
  });
}

module.exports = new QuestionsController();
