import apiClient from "../configs/axiosConfig";

class QuestionServices {
  async getQuestionById(questionId) {
    try {
      const response = await apiClient.get(`/questions/${questionId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching question ${questionId}:`, error);
      throw error;
    }
  }

  async getAllQuestions() {
    try {
      const response = await apiClient.get("/questions");
      console.log("Questions API response status:", response.status);
      return response;
    } catch (error) {
      console.error("Error fetching all questions:", error);
      throw error;
    }
  }

  async getQuizQuestions(quizId) {
    try {
      const response = await apiClient.get(`/questions/quiz/${quizId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching questions for quiz ${quizId}:`, error);
      throw error;
    }
  }
}

export default new QuestionServices();
