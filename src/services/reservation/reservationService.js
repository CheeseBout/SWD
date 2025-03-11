import { api } from "../apiConfig";

export const reservationService = {
  createReservation: async (data) => {
    const response = await api.post(
      "/api/v1/reservation/create-reservation",
      data
    );
    return response.data;
  },
  cancelReservation: async (id) => {
    try {
      const response = await api.put(
        `/api/v1/reservation/cancel-reservation/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      return { message: "Error cancelling reservation" };
    }
  },
  getMemberReservation: async (id, status = "", page = 1, limit = 10) => {
    try {
      const response = await api.get(
        `/api/v1/reservation/get-all-reservation/${id}`,
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
};
