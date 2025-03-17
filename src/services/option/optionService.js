import { api } from "../apiConfig";

export const optionService = {
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
    const response = await api.put("/api/v1/options/update-option", option);
    return response.data;
  },

  deleteOption: async (option) => {
    const response = await api.put("/api/v1/options/delete-option", option);
    return response.data;
  },
};
