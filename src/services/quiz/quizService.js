import { api } from '../apiConfig';

export const quizService = {
  getAllQuizzes: async () => {
    const response = await api.get("/api/v1/quiz");
    return response.data;
  },

  getQuizById: async (id) => {
    try {
      const response = await api.get(`/api/v1/quiz/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching quiz with ID ${id}:`, error);
      throw error;
    }
  },
};
