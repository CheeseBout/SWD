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

  createCategory: async (category) => {
    try {
      const response = await api.post(`/api/v1/category/create`, category);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      return null;
    }
  },

  updateCategory: async (data) => {
    try {
      if (!data.categoryId) {
        console.error("Missing categoryId in update request:", data);
        throw new Error("Category ID is required");
      }

      console.log("Updating category with data:", data);
      const { categoryId, name, description } = data;
      const response = await api.put("/api/v1/category", {
        categoryId,
        name,
        description,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  deleteCategory: async (data) => {
    try {
      if (!data.categoryId) {
        console.error("Missing categoryId in delete request:", data);
        throw new Error("Category ID is required");
      }
      console.log("Deleting category with ID:", data.categoryId);
      const { categoryId } = data;

      const response = await api.delete("/api/v1/category", {
        data: { categoryId },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },
};
