import { api } from '../apiConfig';

export const therapistService = {
  getTherapistById: async (id) => {
    const response = await api.get(`/api/v1/coupletherapist/${id}`);
    return response.data;
  },
  
  searchTherapistsByName: async (searchName) => {
    const response = await api.get("/api/v1/coupletherapist", {
      params: { searchName },
    });
    return response.data;
  },
};
