import { api } from '../apiConfig';

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
