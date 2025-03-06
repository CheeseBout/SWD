import { api } from '../apiConfig';

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
      console.log(`Fetching user with ID: ${id}`);
      const response = await api.get(`/api/v1/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  },
};
