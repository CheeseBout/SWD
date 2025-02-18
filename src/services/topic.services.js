const TOPIC = require("../models/topic.model");
const APIError = require("../utils/ApiError");
class TopicServices {
  async getAllTopics() {
    const data = await TOPIC.find();
    return { data };
  }

  async getTopicById(topicId) {
    const data = await TOPIC.findById(topicId);
    if (!data) {
      throw new APIError(400, "Topic not found");
    }
    return { data };
  }

  async createTopic(req) {
    const userID = req.user._id;
    const requestBody = { ...req.body };
    if (!userID) {
      throw new APIError(400, "User not found");
    }

    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can create topics");
    }

    const data = await TOPIC.create(requestBody);
    return { data };
  }

  async updateTopic(req) {
    const userID = req.user._id;
    const topicId = req.params.topicId;
    const topic = await TOPIC.findById(topicId);
    if (!topic) {
      throw new APIError(400, "Topic not found");
    }

    if (!userID) {
      throw new APIError(400, "User not found");
    }

    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can update topics");
    }

    const requestBody = { ...req.body };
    const updatedTopic = await TOPIC.findByIdAndUpdate(topicId, requestBody, {
      new: true,
    });
    return { updatedTopic };
  }

  async deleteTopic(topicId) {
    const userID = req.user._id;
    const topic = await TOPIC.findById(topicId);
    if (!topic) {
      throw new APIError(400, "Topic not found");
    }
    if (!userID) {
      throw new APIError(400, "User not found");
    }

    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can create topics");
    }

    try {
      const deletedTopic = await TOPIC.findByIdAndUpdate(
        topicId,
        {
          status: "inactive",
          deletedReason,
          lastEdited: Date.now(),
        },
        { new: true }
      );

      if (!deletedTopic) {
        throw new APIError(404, "Quiz not found");
      }

      return {
        success: true,
        message: "Topic deleted successfully",
        data: deletedTopic,
      };
    } catch (error) {
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid quiz ID format");
      }
      throw error;
    }
  }
}

module.exports = new TopicServices();
