const TOPIC = require("../models/topic.model");

class TopicRepository {
  async findAll() {
    return await TOPIC.find();
  }

  async findById(topicId) {
    return await TOPIC.findById(topicId);
  }

  async create(topicData) {
    return await TOPIC.create(topicData);
  }

  async update(topicId, updateData) {
    return await TOPIC.findByIdAndUpdate(topicId, updateData, { new: true });
  }

  async updateStatus(topicId, status, deletedReason) {
    return await TOPIC.findByIdAndUpdate(
      topicId,
      {
        status,
        deletedReason,
        lastEdited: Date.now(),
      },
      { new: true }
    );
  }
}

module.exports = new TopicRepository();
