const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate.middleware");
const { getUserByIdValidation } = require("../validations/user.validation");
const auth = require("../middlewares/auth.middleware");
const topicController = require("../controllers/topic.controller");

//Public Routes
router.get("/", topicController.getAllTopics);

router.get("/:topicId", topicController.getTopicById);
//Protected Routes

router.post("/create-topic", auth, topicController.createTopic);

router.put("/update-topic/:topicId", auth, topicController.updateTopic);

router.put("/delete-topic/:topicId", auth, topicController.deleteTopic);

module.exports = router;
