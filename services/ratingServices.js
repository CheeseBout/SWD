import apiClient from "../configs/axiosConfig";
import { getTokens } from "../utils/tokenStorage";

const ratingServices = {
  // Gửi đánh giá cho một therapist
  submitRating: async (ratingData) => {
    try {
      const tokens = await getTokens();
      console.log(
        "Submitting rating with data:",
        JSON.stringify(ratingData, null, 2)
      );

      // Make sure we're using the correct endpoint and format based on your API
      const response = await apiClient.post("/rating", ratingData, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
      console.log("Rating submission response:", JSON.stringify(response.data));
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
      console.log(`Fetching ratings for therapist: ${therapistId}`);

      const response = await apiClient.get(`/rating/therapist/${therapistId}`, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      console.log("Therapist ratings response:", response.status);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching ratings for therapist ${therapistId}:`,
        error
      );
      return { status: "error", data: [] };
    }
  },

  // Kiểm tra người dùng đã đánh giá therapist cho reservation này chưa
  checkRatingForReservation: async (reservationID) => {
    try {
      const tokens = await getTokens();
      console.log(`Checking rating for reservation: ${reservationID}`);

      // Updated to include the full path matching the backend route
      const response = await apiClient.get(`/rating/check/${reservationID}`, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      console.log(
        "Rating check response:",
        JSON.stringify(response.data, null, 2)
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error checking rating for reservation ${reservationID}:`,
        error
      );
      return { hasRated: false };
    }
  },
};

export default ratingServices;
