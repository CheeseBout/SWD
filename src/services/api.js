import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  login: async (email, password) => {
    const response = await api.post("/api/v1/auth/login", { email, password });
    return response.data;
  },

  loginWithGoogle: async (role) => {
    const failedURL = `${window.location.origin}/login`;
    const successURL = `${window.location.origin}/google-callback`;
    
    window.location.href = `${BASE_URL}/api/v1/auth/login/google?role=${role}&failRedirectURL=${failedURL}&successRedirectURL=${successURL}`;
  },
};

export const topicService = {
  getAllTopics: async () => {
    const response = await api.get("/api/v1/topics");
    return response.data;
  },

  getTopicById: async (id) => {
    const response = await api.get(`/api/v1/topics/${id}`);
    return response.data;
  },
};

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
  }
};
