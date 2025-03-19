import { api } from "../apiConfig";

export const ratingService = {
  async createRating(ratingData) {
    try {
      const response = await api.post("/api/v1/rating", ratingData);
      return response.data;
    } catch (error) {
      console.error("Error creating rating:", error);
      throw error;
    }
  },
  async getAllRating() {
    try {
      const response = await api.get("/api/v1/rating");
      return response.data;
    } catch (error) {
      console.error("Error fetching rating:", error);
      throw error;
    }
  },
  async getRatingById(ratingId) {
    try {
      const response = await api.get(`/api/v1/rating/${ratingId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching rating:", error);
      throw error;
    }
  },
  async updateRating(ratingId, updateData) {
    try {
      const response = await api.put(`/api/v1/rating/${ratingId}`, updateData);
      return response.data;
    } catch (error) {
      console.error("Error updating rating:", error);
      throw error;
    }
  },
  async deleteRating(ratingId) {
    try {
      const response = await api.delete(`/api/v1/rating/${ratingId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting rating:", error);
      throw error;
    }
  },
  async getRatingByTherapistId(id) {
    try {
      const response = await api.get(`/api/v1/rating/therapist/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching rating:", error);
      throw error;
    }
  },
};
