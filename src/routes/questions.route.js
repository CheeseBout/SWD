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

router.put("/update-question/:id", auth, questionsController.updateQuestion);

router.delete("/delete-question/:id", auth, questionsController.deleteQuestion);

//Question Banks
router.post(
  "/create-question-bank",
  auth,
  questionsController.createQuestionsBank
);
module.exports = router;
