const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const questionsController = require("../controllers/questions.controller");

//Public Routes
router.get("/", questionsController.getAllQuestions);

router.get("/:questionId", questionsController.getQuestionById);
//Protected Routes

//Questions
router.post("/create-question", auth, questionsController.createQuestion);

router.put(
  "/update-question/:questionId",
  auth,
  questionsController.updateQuestion
);

router.put(
  "/delete-question/:questionId",
  auth,
  questionsController.deleteQuestion
);

//Question Banks
router.post(
  "/create-question-bank",
  auth,
  questionsController.createQuestionsBank
);

router.put(
  "/update-question-bank/:questionBankId",
  auth,
  questionsController.updateQuestionsBank
);

router.put(
  "/delete-question-bank/:questionBankId",
  auth,
  questionsController.deleteQuestionsBank
);
module.exports = router;
