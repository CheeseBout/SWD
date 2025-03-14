import { api } from "../apiConfig";

class AvailabilityService {
  // Get all availability slots for the therapist
  async getTherapistAvailability() {
    try {
      // Get the therapistId from localStorage (stored during login)
      const therapistId = localStorage.getItem("therapistId");

      if (!therapistId) {
        throw new Error("Therapist ID not found");
      }

      console.log("Getting availability for therapist:", therapistId);

      // Return the full response to access data.data.availability structure
      return await api.get(
        `/api/v1/coupletherapist/get-availability/${therapistId}`
      );
    } catch (error) {
      console.error("Error fetching availability:", error);
      throw error;
    }
  }

  // Create new availability slot
  async createAvailability(availabilityData) {
    try {
      console.log(
        "Creating availability with data:",
        JSON.stringify(availabilityData, null, 2)
      );
      const response = await api.post(
        "/api/v1/coupletherapist/create-availability",
        availabilityData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating availability:", error);
      throw error;
    }
  }

  // Update an existing availability slot
  async updateAvailability(id, availabilityData) {
    try {
      console.log(
        "Updating availability with data:",
        JSON.stringify(availabilityData, null, 2)
      );
      const response = await api.put(
        `/api/v1/coupletherapist/update-availability/${id}`,
        availabilityData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating availability:", error);
      throw error;
    }
  }

  // Delete an availability slot
  async deleteAvailability(id) {
    try {
      const response = await api.delete(
        `/api/v1/coupletherapist/delete-availability/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting availability:", error);
      throw error;
    }
  }

  // Get availability slots for a specific therapist (for members to view)
  async getAvailabilityByTherapistId(therapistId) {
    try {
      const response = await api.get(
        `/api/v1/coupletherapist/get-availability/${therapistId}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching therapist availability:", error);
      throw error;
    }
  }
}

export const availabilityService = new AvailabilityService();
