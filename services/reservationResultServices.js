import apiClient from "../configs/axiosConfig";
import { getTokens } from "../utils/tokenStorage";

const reservationResultServices = {
  getReservationResult: async (reservationId) => {
    try {
      const response = await apiClient.get(
        `/reservation-result/get-reservation-result/reservation/${reservationId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching reservation result:`, error);
    }
  },

  getReservationResultByUser: async (userId) => {
    try {
      const response = await apiClient.get(
        `/reservation-result/get-all-reservation-result/user/${userId}`
      );
      console.log("Reservation result by User id: ", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching reservation result:`, error);
    }
  },
};

export default reservationResultServices;
