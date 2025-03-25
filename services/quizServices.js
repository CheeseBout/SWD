import apiClient from "../configs/axiosConfig";
import { getTokens } from "../utils/tokenStorage";

const quizServices = {
  getAllQuizzes: async () => {
    try {
      const response = await apiClient.get(`/api/quizzes`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getQuizById: async (quizId) => {
    try {
      console.log("quizid", quizId);
      const response = await apiClient.get(`/quiz/${quizId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  submitQuizResults: async (answers) => {
    const tokens = await getTokens();
    try {
      // The API expects an array of objects with questionID and optionID
      // Example: [{ optionID: "67ac238bf16cb78b36e1feaa", questionID: "67ac2382f16cb78b36e1fea2" }]
      console.log(
        "Sending quiz answers to API:",
        JSON.stringify(answers, null, 2)
      );

      console.log("Tokens:", tokens);

      const response = await apiClient.post(`/options/select-option`, answers, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
      return response;
    } catch (error) {
      console.error("Error in submitQuizResults:", error);
      throw error;
    }
  },
};

export default quizServices;
