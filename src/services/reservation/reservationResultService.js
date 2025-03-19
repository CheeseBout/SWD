import { api } from "../apiConfig";

export const reservationResultService = {
  async createReservationResult(resultData) {
    try {
      const response = await api.post(
        "/api/v1/reservation-result/create-reservation-result",
        resultData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating reservation result:", error);
      throw error;
    }
  },

  async getResultByReservationId(reservationID) {
    try {
      const response = await api.get(
        `/api/v1/reservation-result/get-reservation-result/reservation/${reservationID}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching reservation result:", error);
      throw error;
    }
  },

  async updateReservationResult(reservationResultID, updateData) {
    try {
      const response = await api.put(
        `/api/v1/reservation-result/update-reservation-result/${reservationResultID}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating reservation result:", error);
      throw error;
    }
  },

  async getAllReservationResultByUserId(userId) {
    try {
      const response = await api.get(
        `/api/v1/reservation-result/get-all-reservation-result/user/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching reservation result:", error);
      throw error;
    }
  },

  async deleteReservationResult(reservationResultID, deleteReason) {
    try {
      const response = await api.put(
        `/api/v1/reservation-result/delete-reservation-result/${reservationResultID}`,
        { deleteReason }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting reservation result:", error);
      throw error;
    }
  },
};
