import { api } from "../apiConfig";

export const reservationService = {
  // Get all reservations for a therapist
  async getTherapistReservation(
    therapistId,
    status = "",
    page = 1,
    limit = 10
  ) {
    try {
      const response = await api.get(
        `/api/v1/reservation/get-all-reservation/therapist/${therapistId}`,
        {
          params: {
            status: status || undefined,
            page,
            limit,
          },
        }
      );
      return response?.data?.data;
    } catch (error) {
      console.error("Error fetching therapist reservations:", error);
      throw error;
    }
  },

  async createReservation(reservationData) {
    try {
      const response = await api.post(
        "/api/v1/reservation/create-reservation",
        reservationData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating reservation:", error);
      throw error;
    }
  },

  // Get all reservations for a member
  getMemberReservation: async (id, status = "", page = 1, limit = 10) => {
    try {
      const response = await api.get(
        `/api/v1/reservation/get-all-reservation/user/${id}`,
        {
          params: {
            status: status || undefined,
            page,
            limit,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching member reservation:", error);
      return { reservations: [], total: 0, page: 1, pages: 1 };
    }
  },

  // Cancel a reservation
  async cancelReservation(reservationId) {
    try {
      const response = await api.put(
        `/api/v1/reservation/delete-reservation/${reservationId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      throw error;
    }
  },

  // Update reservation status
  // async updateReservationStatus(reservationId, status, reason = "") {
  //   try {
  //     const data = { status };
  //     if (reason) data.reason = reason;

  //     const response = await api.put(
  //       `/api/v1/coupletherapist/reservation/${reservationId}`,
  //       data
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error updating reservation status:", error);
  //     throw error;
  //   }
  // },

  async denyReservation(reservationId, reason) {
    try {
      const response = await api.put(
        `/api/v1/reservation/deny-reservation/${reservationId}`,
        { reason }
      );
      return response.data;
    } catch (error) {
      console.error("Error denying reservation:", error);
      throw error;
    }
  },
  async approveReservation(reservationId) {
    try {
      const response = await api.put(
        `/api/v1/reservation/approve-reservation/${reservationId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error approving reservation:", error);
      throw error;
    }
  },
  async getReservationById(reservationId) {
    try {
      const response = await api.get(
        `/api/v1/reservation/get-reservation/${reservationId}`
      );
      return response?.data?.data;
    } catch (error) {
      console.error("Error fetching reservation:", error);
      throw error;
    }
  },
};
