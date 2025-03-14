import { api } from "../apiConfig";

class PackageService {
  // Get all packages for a therapist
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

  // Create a new package
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

  // Update an existing package
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

  // Delete a package
  async deletePackage(packageId) {
    try {
      const response = await api.delete(
        `/api/v1/package/delete-package/${packageId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting package:", error);
      throw error;
    }
  }

  // Get package details by ID
  async getPackageById(packageId) {
    try {
      const response = await api.get(`/api/v1/package/${packageId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching package details:", error);
      throw error;
    }
  }
}

export const packageService = new PackageService();
