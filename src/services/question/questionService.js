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

  deleteQuestion: async (question) => {
    const response = await api.put(
      "/api/v1/questions/delete-question",
      question
    );
    return response.data;
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
  
  createOptionsForQuestion: async (questionID, options) => {
    // Format the payload exactly as the API expects
    const payload = {
      questionId: questionID,  // Changed from questionID to questionId
      options
    };
    console.log("Options API payload:", JSON.stringify(payload));
    
    // Try a different endpoint path that might be correct
    const response = await api.post("/api/v1/options/create-question-options", payload);
    
    // Log the response for debugging
    console.log("Options API response:", response.data);
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
};
