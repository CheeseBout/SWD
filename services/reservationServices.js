import apiClient from "../configs/axiosConfig";
import { getTokens } from "../utils/tokenStorage";

const reservationServices = {
  getAllReservationByUser: async (userId) => {
    try {
      const tokens = await getTokens();
      const response = await apiClient.get(
        `/reservation/get-all-reservation/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );

      console.log(
        "Reservation response:",
        JSON.stringify(response.data, null, 2)
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user reservations:", error);
      throw error;
    }
  },

  getReservationById: async (reservationId) => {
    try {
      const tokens = await getTokens();
      const response = await apiClient.get(
        `/reservation/get-reservation/${reservationId}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching reservation ${reservationId}:`, error);
      throw error;
    }
  },

  cancelReservation: async (reservationId) => {
    try {
      const tokens = await getTokens();
      const response = await apiClient.put(
        `/reservations/${reservationId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error canceling reservation ${reservationId}:`, error);
      throw error;
    }
  },

  createReservation: async (reservationData) => {
    try {
      const tokens = await getTokens();
      console.log("Creating reservation with data:", reservationData);

      const response = await apiClient.post(
        "/reservation/create-reservation",
        reservationData,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );

      console.log("Reservation creation response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating reservation:", error);
      throw error;
    }
  },
};

export default reservationServices;
