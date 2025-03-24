import { api } from "../apiConfig";

export const categoryService = {
  getAllCategories: async () => {
    try {
      const response = await api.get(`/api/v1/category`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all categories:", error);
      return [];
    }
  },
};
