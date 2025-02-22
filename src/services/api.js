import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const topicService = {
  getAllTopics: async () => {
    const response = await api.get('/api/v1/topics');
    return response.data;
  },

  getTopicById: async (id) => {
    const response = await api.get(`/api/v1/topics/${id}`);
    return response.data;
  }
};

export const quizService = {
  getAllQuizzes: async () => {
    const response = await api.get('/api/v1/quiz');
    return response.data;
  },

  getQuizById: async (id) => {
    const response = await api.get(`/api/v1/quiz/${id}`);
    return response.data;
  }
};
