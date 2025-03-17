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
};
