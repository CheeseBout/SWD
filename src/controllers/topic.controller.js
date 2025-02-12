const topicServices = require("../services/topic.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class TopicController {
  getAllTopics = catchAsync(async (req, res) => {
    return OK(res, "Success", await topicServices.getAllTopics());
  });

  getTopicById = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await topicServices.getTopicById(req.params.topicId)
    );
  });

  createTopic = catchAsync(async (req, res) => {
    return OK(res, "Success", await topicServices.createTopic(req));
  });

  updateTopic = catchAsync(async (req, res) => {
    return OK(res, "Success", await topicServices.updateTopic(req));
  });

  deleteTopic = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await topicServices.deleteTopic(req.params.topicId)
    );
  });
}

module.exports = new TopicController();
