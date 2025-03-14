import apiClient from "../configs/axiosConfig";
import { getTokens } from "../utils/tokenStorage";

class PackageServices {
  async getPackageByTherapistId(therapistId) {
    try {
      const tokens = await getTokens();
      const response = await apiClient.get(
        `/package/get-package/${therapistId}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      console.log("Package API response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching packages for therapist ${therapistId}:`,
        error
      );
      throw error;
    }
  }
}

export default new PackageServices();
