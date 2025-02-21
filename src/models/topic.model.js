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
  quiz: [
    {
      quizName: {
        type: String,
      },
      quizDescription: {
        type: String,
      },
      questions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Questions",
        },
      ],
      userAnswer: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserAnswers",
        },
      ],
      imageUrl: {
        type: String,
      },
      status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
      },
      deletedReason: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      lastEdited: {
        type: Date,
        default: Date.now,
      },
    },
  ],
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
