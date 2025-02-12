const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const quizController = require("../controllers/quiz.controller");

//Public Routes
router.get("/", quizController.getAllQuizzes);

router.get("/:id", quizController.getQuizById);
//Protected Routes

router.post("/create-quiz", auth, quizController.createQuiz);

router.put("/update-quiz", auth, quizController.updateQuiz);

router.put("/delete-quiz", auth, quizController.deleteQuiz);

module.exports = router;
