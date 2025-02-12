const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate.middleware");
const { getUserByIdValidation } = require("../validations/user.validation");
const auth = require("../middlewares/auth.middleware");
const topicController = require("../controllers/topic.controller");

//Public Routes
router.get("/", topicController.getAllTopics);

router.get("/:id", topicController.getTopicById);
//Protected Routes

router.post("/create-topic", auth, topicController.createTopic);

router.put("/update-topic/:id", auth, topicController.updateTopic);

router.delete("/delete-topic/:id", auth, topicController.deleteTopic);

module.exports = router;
