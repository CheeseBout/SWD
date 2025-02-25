const APIError = require("../utils/ApiError");
const topicRepo = require("../repositories/topic.repo");

class TopicServices {
  async getAllTopics() {
    const topics = await topicRepo.findAll();
    return { topics };
  }

  async getTopicById(topicId) {
    const topic = await topicRepo.findById(topicId);
    if (!topic) {
      throw new APIError(400, "Topic not found");
    }
    return { topic };
  }

  async createTopic(req) {
    const userID = req.user._id;
    if (!userID) {
      throw new APIError(400, "User not found");
    }

    if (req.user.role !== "admin" && req.user.role !== "couple_therapist") {
      throw new APIError(
        403,
        "Only admin and couple therapist can create topics"
      );
    }

    const data = await topicRepo.create(req.body);
    return { data };
  }

  async updateTopic(req) {
    const { topicId } = req.params;
    const userID = req.user._id;

    if (!userID) {
      throw new APIError(400, "User not found");
    }

    const topic = await topicRepo.findById(topicId);
    if (!topic) {
      throw new APIError(400, "Topic not found");
    }

    if (req.user.role !== "admin" && req.user.role !== "couple_therapist") {
      throw new APIError(
        403,
        "Only admin and couple therapist can update topics"
      );
    }

    const updatedTopic = await topicRepo.update(topicId, req.body);
    return { updatedTopic };
  }

  async deleteTopic(req) {
    const { topicId } = req.params;
    const { deletedReason } = req.body;
    const userID = req.user._id;

    if (!userID) {
      throw new APIError(400, "User not found");
    }

    const topic = await topicRepo.findById(topicId);
    if (!topic) {
      throw new APIError(400, "Topic not found");
    }

    if (req.user.role !== "admin" && req.user.role !== "couple_therapist") {
      throw new APIError(
        403,
        "Only admin and couple therapist can delete topics"
      );
    }

    try {
      const deletedTopic = await topicRepo.updateStatus(
        topicId,
        "inactive",
        deletedReason
      );
      if (!deletedTopic) {
        throw new APIError(404, "Topic not found");
      }

      return {
        success: true,
        message: "Topic deleted successfully",
        data: deletedTopic,
      };
    } catch (error) {
      if (error.name === "CastError") {
        throw new APIError(400, "Invalid topic ID format");
      }
      throw error;
    }
  }
}

module.exports = new TopicServices();
