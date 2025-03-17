import apiClient from "../configs/axiosConfig";
import { getTokens } from "../utils/tokenStorage";

const ratingServices = {
  // Gửi đánh giá cho một therapist
  submitRating: async (ratingData) => {
    try {
      const tokens = await getTokens();
      const response = await apiClient.post("/rating", ratingData, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
      console.log("Rating submission response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error submitting rating:", error);
      throw error;
    }
  },

  // Lấy đánh giá theo therapist ID
  getRatingsByTherapistId: async (therapistId) => {
    try {
      const tokens = await getTokens();
      const response = await apiClient.get(
        `/ratings/therapist/${therapistId}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching ratings for therapist ${therapistId}:`,
        error
      );
      throw error;
    }
  },

  // Kiểm tra người dùng đã đánh giá reservation chưa
  checkRatingForReservation: async (reservationId) => {
    try {
      const tokens = await getTokens();
      const response = await apiClient.get(
        `/rating/${reservationId}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error checking rating for reservation ${reservationId}:`,
        error
      );
      return { hasRated: false };
    }
  },
};

export default ratingServices;
