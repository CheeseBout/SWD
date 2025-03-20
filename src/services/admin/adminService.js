import { api } from "../apiConfig";

export const adminService = {
  getAllCertificateRequests: async () => {
    try {
      const response = await api.get(`/api/v1/admin/certificate-requests`);
      return response.data;
    } catch (error) {
      console.error("Error getting all certificate requests:", error);
      throw error;
    }
  },

  manageCertificate: async (certificateID, action, reason = "") => {
    try {
      if (!certificateID || !action) {
        throw new Error("Certificate ID and action are required");
      }

      const payload = {
        action,
        certificateID,
        reason: reason || ""
      };

      console.log("Sending payload to manage certificate:", payload);
      
      const response = await api.post("/api/v1/admin/manage-certificate", payload);
      
      return response.data;
    } catch (error) {
      console.error("Error managing certificate:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  },

  getRevenue: async () => {
    try {
      const response = await api.get("/api/v1/admin/revenue");
      return response.data;
    } catch (error) {
      console.error("Error getting revenue:", error);
      throw error;
    }
  }
};
