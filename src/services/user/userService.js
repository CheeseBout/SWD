import { api } from "../apiConfig";

export const userService = {
  getAllUsers: async () => {
    const response = await api.get("/api/v1/users");
    return response.data;
  },

  getUserById: async (id) => {
    try {
      if (!id) {
        throw new Error("User ID is required");
      }
      const response = await api.get(`/api/v1/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  },

  getUserProfile: async () => {
    try {
      const response = await api.get("/api/v1/users/my-profile");
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  updateUserProfile: async (data) => {
    try {
      const response = await api.put("/api/v1/users/update-profile", data);
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },
};
