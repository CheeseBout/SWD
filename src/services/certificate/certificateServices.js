import { api } from "../apiConfig";

class CertificateServices {
  async getCertificateByTherapistId(id) {
    try {
      const response = await api.get(`/api/v1/coupletherapist/${id}`);
      //map certificate from data

      return response.data;
    } catch (error) {
      console.error("Error fetching certificates:", error);
      throw error;
    }
  }

  async createCertificate(data) {
    try {
      const response = await api.post(
        "/api/v1/auth/update-expert-profile",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating certificate:", error);
      throw error;
    }
  }
}

export const certificateServices = new CertificateServices();