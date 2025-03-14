import { api } from "../apiConfig";

export const adminService = {
  manageCertificate: async (userId, action, courseId, reason = "") => {
    try {
      const response = await api.post(`/api/v1/admin/manage-certificate`, {
        userId,
        action,
        courseId,
        reason
      });
      return response.data;
    } catch (error) {
      console.error("Error managing certificate:", error);
      throw error;
    }
  },
};
