const { required } = require("joi");
const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  questionBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuestionBanks",
  },
  imageUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastEdited: {
    type: Date,
    default: Date.now,
  },
});

const TOPIC = mongoose.model("Topics", topicSchema);
module.exports = TOPIC;
