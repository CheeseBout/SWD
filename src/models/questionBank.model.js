const mongoose = require("mongoose");

const questionBankSchema = new mongoose.Schema({
  questionBankName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topics",
    required: true,
  }, //Đảm bảo mối quan hệ 1-1
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Questions",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastEdited: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  deletedReason: {
    type: String,
  },
});

const QUESTION_BANK = mongoose.model("QuestionBank", questionBankSchema);
module.exports = QUESTION_BANK;
