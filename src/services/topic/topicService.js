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

  createTopic: async (topic) => {
    const response = await api.post("/api/v1/topics/create-topic", topic);
    return response.data;
  },

  updateTopic: async (topic) => {
    const response = await api.put(`/api/v1/topics/update-topic`, topic);
    return response.data;
  },

  deleteTopic: async (topic) => {
    const response = await api.put(`/api/v1/topics/delete-topic`, topic);
    return response.data;
  },

  activateTopic: async (topic) => {
    const response = await api.put(`/api/v1/topics/activate-topic`, topic);
    return response.data;
  },
};
