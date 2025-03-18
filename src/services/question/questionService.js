import { api } from "../apiConfig";

export const questionService = {
  getAllQuestions: async () => {
    const response = await api.get("/api/v1/questions");
    return response.data;
  },

  getQuestionById: async (id) => {
    const response = await api.get(`/api/v1/questions/${id}`);
    return response.data;
  },

  createQuestion: async (question) => {
    const response = await api.post(
      "/api/v1/questions/create-question",
      question
    );
    return response.data;
  },

  updateQuestion: async (question) => {
    const response = await api.put(
      "/api/v1/questions/update-question",
      question
    );
    return response.data;
  },

  deleteQuestion: async (data) => {
    console.log("Sending delete request with data:", data);
    try {
      const response = await api.put("/api/v1/questions/delete-question", data);
      return response.data;
    } catch (error) {
      console.error("Delete question error details:", error.response?.data);
      throw error;
    }
  },

  getAllQuestionBanks: async () => {
    const response = await api.get("/api/v1/questions/get-all-question-banks");
    return response.data;
  },

  createQuestionBank: async (questionBank) => {
    const response = await api.post(
      "/api/v1/questions/create-question-bank",
      questionBank
    );
    return response.data;
  },

  activeQuestionBank: async (questionBank) => {
    const response = await api.put(
      "/api/v1/questions/activate-question-bank",
      questionBank
    );
    return response.data;
  },

  deleteQuestionBank: async (questionBank) => {
    const response = await api.put(
      "/api/v1/questions/delete-question-bank",
      questionBank
    );
    return response.data;
  },

  updateQuestionBank: async (questionBank) => {
    const response = await api.put(
      "/api/v1/questions/update-question-bank",
      questionBank
    );
    return response.data;
  },

  getAllOptions: async () => {
    const response = await api.get("/api/v1/options");
    return response.data;
  },

  getOptionById: async (id) => {
    const response = await api.get(`/api/v1/options/${id}`);
    return response.data;
  },

  createOption: async (option) => {
    const response = await api.post("/api/v1/options/create-option", option);
    return response.data;
  },

  updateOption: async (option) => {
    const response = await api.put("/api/v1/options/update", option);
    return response.data;
  },

  deleteOption: async () => {
    const response = await api.delete("/api/v1/options/delete");
    return response.data;
  },

  getQuestionsByTopic: async (topicId) => {
    try {
      const response = await questionService.getAllQuestionBanks();

      const questionBanks = response?.data?.data || [];
      const topicQuestionBanks = questionBanks.filter(
        (bank) => bank.topic === topicId && bank.status === "active"
      );

      const questionIds = topicQuestionBanks.flatMap(
        (bank) => bank.questions || []
      );

      if (questionIds.length === 0) {
        return { data: { questions: [] } };
      }

      const questionPromises = questionIds.map(async (qId) => {
        try {
          if (typeof qId === "object" && qId !== null && qId._id) {
            return qId;
          }

          const questionData = await questionService.getQuestionById(qId);
          return questionData.data || null;
        } catch (err) {
          console.error(`Error fetching question with ID ${qId}:`, err);
          return null;
        }
      });

      const questions = await Promise.all(questionPromises);
      const validQuestions = questions.filter((q) => q !== null);

      const formattedQuestions = validQuestions.map((q) => ({
        _id: q._id,
        questionText: q.questionContent || q.question || "Unknown question",
        options: q.options || [],
        type: q.type || "multiple-choice",
      }));

      return { data: { questions: formattedQuestions } };
    } catch (error) {
      console.error("Error getting questions by topic:", error);
      throw error;
    }
  },
};
