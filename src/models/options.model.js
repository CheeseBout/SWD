const mongoose = require("mongoose");

const optionsSchema = new mongoose.Schema({
  questionID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Questions",
    required: true,
  },
  options: [
    {
      optionContent: {
        type: String,
        required: true,
      },
      score: {
        type: Number,
        required: true,
      },
      userAnswers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserAnswers",
        },
      ],
    },
  ],
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

const OPTIONS = mongoose.model("Options", optionsSchema);
module.exports = OPTIONS;
