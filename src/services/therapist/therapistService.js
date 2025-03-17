import { api } from "../apiConfig";

export const therapistService = {
  getAllTherapists: async () => {
    const response = await api.get("/api/v1/coupletherapist");
    return response.data;
  },

  getTherapistById: async (id) => {
    const response = await api.get(`/api/v1/coupletherapist/${id}`);
    return response.data;
  },

  getTherapistIdByUserId: async (userId) => {
    const response = await api.get(
      `/api/v1/coupletherapist/get-therapistId/${userId}`
    );
    return response.data.data;
  },

  searchTherapistsByName: async (searchName) => {
    const response = await api.get("/api/v1/coupletherapist", {
      params: { searchName },
    });
    return response.data;
  },

  getAvailability: async (id) => {
    const response = await api.get(
      `api/v1/coupletherapist/get-availability/${id}`
    );
    return response.data;
  },

  updateTherapistProfile: async (id, data) => {
    console.log("Updating therapist profile with ID:", id);
    console.log("Update data:", data);
    const response = await api.put(
      `/api/v1/auth/update-therapist-profile`,
      data
    );
    return response.data;
  },
};
