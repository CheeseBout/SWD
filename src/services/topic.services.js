const APIError = require("../utils/ApiError");
const topicRepo = require("../repositories/topic.repo");

class TopicServices {
  async getAllTopics() {
    const topics = await topicRepo.findAll();
    return { topics };
  }

  async getTopicById(req) {
    const { topicId } = req.params;
    if (!topicId) {
      throw new APIError(400, "Topic ID is required");
    }

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

    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can create topics");
    }

    const data = await topicRepo.create(req.body);
    return { data };
  }

  async updateTopic(req) {
    const { topicId, name, description, imageUrl } = req.body;

    if (!topicId) {
      throw new APIError(400, "Topic ID is required");
    }

    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can update topics");
    }

    const topic = await topicRepo.findById(topicId);
    if (!topic) {
      throw new APIError(400, "Topic not found");
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (imageUrl) updateData.imageUrl = imageUrl;
    updateData.lastEdited = Date.now();

    const updatedTopic = await topicRepo.update(topicId, updateData);
    return { updatedTopic };
  }

  async deleteTopic(req) {
    const { topicId } = req.body;

    if (!topicId) {
      throw new APIError(400, "Topic ID is required");
    }

    const userID = req.user._id;

    if (!userID) {
      throw new APIError(400, "User not found");
    }

    const topic = await topicRepo.findById(topicId);
    if (!topic) {
      throw new APIError(400, "Topic not found");
    }

    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can delete topics");
    }

    try {
      const deletedTopic = await topicRepo.updateStatus(topicId, "inactive");
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

  async activateTopic(req) {
    const { topicId } = req.body;
    const userID = req.user._id;

    if (!userID) {
      throw new APIError(400, "User not found");
    }

    if (!topicId) {
      throw new APIError(400, "Topic ID is required");
    }

    const topic = await topicRepo.findById(topicId);
    if (!topic) {
      throw new APIError(400, "Topic not found");
    }

    if (req.user.role !== "admin") {
      throw new APIError(403, "Only admin can activate topics");
    }

    try {
      const activatedTopic = await topicRepo.updateStatus(topicId, "active");

      // Optionally activate associated quizzes
      if (topic.quiz && topic.quiz.length > 0) {
        for (const quiz of topic.quiz) {
          quiz.status = "active";
        }
        await topic.save();
      }

      return {
        success: true,
        message: "Topic activated successfully",
        data: activatedTopic,
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
