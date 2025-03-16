const reservationResultRepo = require("../repositories/reservationResult.repo");
const mongoose = require("mongoose");
const APIError = require("../utils/ApiError");

class ReservationResultService {
  async createReservationResult(data) {
    // Validate reservation exists
    if (
      !(await reservationResultRepo.findReservationById(data.reservationID))
    ) {
      throw new APIError(400, "Reservation not found");
    }

    // Check if the result is a duplicate
    if (await this.checkDuplicate(data)) {
      throw new APIError(400, "Reservation result duplicated");
    }

    // Create new reservation result using the repo
    const reservationResult = await reservationResultRepo.create({
      reservationID: data.reservationID,
      sessionSummary: data.sessionSummary,
      issuesIdentified: data.issuesIdentified,
      therapistRecommendations: data.therapistRecommendations,
      homeworkAssignment: data.homeworkAssignment,
      status: "completed",
      deleteReason: null,
    });

    return reservationResult;
  }

  async getReservationResult(reservationResultID) {
    const response = await reservationResultRepo.findById(reservationResultID);
    if (!response) {
      throw new APIError(400, "Reservation result not found");
    }
    return response;
  }

  async updateReservationResult(reservationResultID, data) {
    const updateData = {};

    if (data.sessionSummary) updateData.sessionSummary = data.sessionSummary;
    if (data.issuesIdentified)
      updateData.issuesIdentified = data.issuesIdentified;
    if (data.therapistRecommendations)
      updateData.therapistRecommendations = data.therapistRecommendations;
    if (data.homeworkAssignment)
      updateData.homeworkAssignment = data.homeworkAssignment;

    const updatedReservationResult = await reservationResultRepo.updateById(
      reservationResultID,
      updateData
    );

    if (!updatedReservationResult) {
      throw new APIError(404, "Reservation result not found");
    }

    return updatedReservationResult;
  }

  async deleteReservationResult(reservationResultID, deleteReason) {
    if (!deleteReason) {
      throw new APIError(400, "Delete reason is required");
    }

    // Update status to 'deleted' and include the delete reason
    const updatedReservationResult = await reservationResultRepo.updateById(
      reservationResultID,
      {
        status: "deleted",
        deleteReason: deleteReason,
      }
    );

    if (!updatedReservationResult) {
      throw new APIError(404, "Reservation result not found");
    }

    return updatedReservationResult;
  }

  async getAllReservationResultsByUser(userID, options = {}) {
    try {
      // Validate userID format
      if (!mongoose.Types.ObjectId.isValid(userID)) {
        throw new APIError(400, "Invalid user ID format");
      }

      // Check if the requesting user is authorized (must be the same user or an admin)
      if (
        options.user &&
        options.user.role !== "admin" &&
        options.user._id.toString() !== userID &&
        options.user.role !== "member"
      ) {
        throw new APIError(
          403,
          "Permission denied: Only members can access their own reservation results"
        );
      }

      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;

      // Get the reservations made by this user
      const userReservations =
        await reservationResultRepo.findReservationsByUser(userID);

      // Return empty results if no reservations found
      if (!userReservations || userReservations.length === 0) {
        return {
          results: [],
          total: 0,
          page: parseInt(page),
          pages: 0,
        };
      }

      // Get the IDs of the reservations
      const reservationIds = userReservations.map((res) => res._id);

      // Create filter for results
      const filter = {
        reservationID: { $in: reservationIds },
      };

      // Add status filter if provided
      if (options.status) {
        filter.status = options.status;
      }

      // Get the results
      const results = await reservationResultRepo.findAll(filter, skip, limit);
      const total = await reservationResultRepo.count(filter);

      return {
        results,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Error in getAllReservationResultsByUser:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, "Error retrieving reservation results");
    }
  }

  async getAllReservationResultsByTherapist(therapistID, options = {}) {
    try {
      // Validate therapistID format
      if (!mongoose.Types.ObjectId.isValid(therapistID)) {
        throw new APIError(400, "Invalid therapist ID format");
      }

      // Check if the requesting user is authorized (must be the same therapist or an admin)
      if (
        options.user &&
        options.user.role !== "admin" &&
        options.user._id.toString() !== therapistID &&
        options.user.role !== "couple_therapist"
      ) {
        throw new APIError(
          403,
          "Permission denied: Only couple therapists can access their own reservation results"
        );
      }

      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;

      // Get the reservations handled by this therapist
      const therapistReservations =
        await reservationResultRepo.findReservationsByTherapist(therapistID);

      if (!therapistReservations || therapistReservations.length === 0) {
        return {
          results: [],
          total: 0,
          page: page,
          pages: 0,
        };
      }

      // Get the IDs of the reservations
      const reservationIds = therapistReservations.map((res) => res._id);

      // Create filter for results
      const filter = {
        reservationID: { $in: reservationIds },
      };

      // Add status filter if provided
      if (options.status) {
        filter.status = options.status;
      }

      // Get the results
      const results = await reservationResultRepo.findAll(filter, skip, limit);
      const total = await reservationResultRepo.count(filter);

      return {
        results,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, "Error retrieving reservation results");
    }
  }

  async checkDuplicate(data) {
    const existing = await reservationResultRepo.findOne({
      reservationID: data.reservationID,
      sessionSummary: data.sessionSummary,
      status: "completed",
    });
    return existing !== null;
  }
}

module.exports = new ReservationResultService();
