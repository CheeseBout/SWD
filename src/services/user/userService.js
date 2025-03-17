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

  inactiveUser: async (data) => {
    try {
      const response = await api.put(`/api/v1/users/inactive-user`, data);
      return response.data;
    } catch (error) {
      console.error("Error inactive user:", error);
      throw error;
    }
  },

  activeUser: async (data) => {
    try {
      const response = await api.put(`/api/v1/users/active-user`, data);
      return response.data;
    } catch (error) {
      console.error("Error active user:", error);
      throw error;
    }
  }
};
