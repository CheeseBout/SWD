import { api } from "../apiConfig";

class PackageService {
  async getTherapistPackages(therapistId) {
    try {
      const response = await api.get(
        `/api/v1/package/get-package/${therapistId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching therapist packages:", error);
      throw error;
    }
  }

  async getAllPackages() {
    try {
      const response = await api.get("/api/v1/package/get-all-package");
      return response.data;
    } catch (error) {
      console.error("Error fetching all packages:", error);
      throw error;
    }
  }

  async createPackage(packageData) {
    try {
      const response = await api.post(
        "/api/v1/package/create-package",
        packageData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating package:", error);
      throw error;
    }
  }

  async updatePackage(packageId, packageData) {
    try {
      const response = await api.put(
        `/api/v1/package/update-package/${packageId}`,
        packageData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating package:", error);
      throw error;
    }
  }

  async softDeletePackage(packageId) {
    try {
      const response = await api.put(
        `/api/v1/package/delete-package/${packageId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting package:", error);
      throw error;
    }
  }

  async hardDeletePackage(packageId) {
    try {
      const response = await api.delete(
        `/api/v1/package/hard-delete-package/${packageId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting package:", error);
      throw error;
    }
  }

  async getPackageDetail  (packageId) {
    try {
      const response = await api.get(`/api/v1/package/get-package-detail/${packageId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching package details:", error);
      throw error;
    }
  }
}

export const packageService = new PackageService();
