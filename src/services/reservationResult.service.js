const reservationResultRepo = require("../repositories/reservationResult.repo");
const mongoose = require("mongoose");
const APIError = require("../utils/ApiError");
const PAYMENT = require("../models/payment.model");
const TRANSACTION = require("../models/transaction.model");
const reservationsRepo = require("../repositories/reservations.repo");

class ReservationResultService {
  async createReservationResult(req) {
    try {
      const data = req.body;
      const user = req.user;

      console.log("User in request:", user);
      console.log("Auth headers:", req.headers.authorization);
      console.log("Data:", data);

      // Check authentication
      if (!user) {
        throw new APIError(401, "Authentication required");
      }

      // Check authorization
      if (user.role !== "couple_therapist") {
        throw new APIError(
          403,
          "Permission denied: Only couple therapists can create reservation results"
        );
      }

      // Validate reservation exists
      const reservation = await reservationResultRepo.findReservationById(
        data.reservationID
      );
      if (!reservation) {
        throw new APIError(400, "Reservation not found");
      }

      // Check if the result is a duplicate
      if (await this.checkDuplicate(data)) {
        throw new APIError(
          400,
          "Reservation result already exists for this reservation"
        );
      }

      // Create new reservation result using the repo
      const reservationResult = await reservationResultRepo.create({
        reservationID: data.reservationID,
        sessionSummary: data.sessionSummary,
        issuesIdentified: data.issuesIdentified,
        therapistRecommendations: data.therapistRecommendations,
        homeworkAssignment: data.homeworkAssignment,
        status: "pending",
        deleteReason: null,
      });

      return reservationResult;
    } catch (error) {
      console.error("Error in createReservationResult:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, "Failed to create reservation result");
    }
  }

  async getReservationResult(reservationResultID) {
    try {
      const response = await reservationResultRepo.findById(
        reservationResultID
      );
      if (!response) {
        throw new APIError(404, "Reservation result not found");
      }
      return response;
    } catch (error) {
      console.error("Error in getReservationResult:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, "Error retrieving reservation result");
    }
  }

  async updateReservationResult(reservationResultID, data, user) {
    try {
      if (!user) {
        throw new APIError(401, "Authentication required");
      }

      if (!mongoose.Types.ObjectId.isValid(reservationResultID)) {
        throw new APIError(400, "Invalid reservation result ID");
      }

      // Get the existing result
      const existingResult = await reservationResultRepo.findById(
        reservationResultID
      );
      if (!existingResult) {
        throw new APIError(404, "Reservation result not found");
      }

      // Get the associated reservation to check permissions
      const reservation = await reservationResultRepo.findReservationById(
        existingResult.reservationID
      );
      if (!reservation) {
        throw new APIError(404, "Related reservation not found");
      }

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
    } catch (error) {
      console.error("Error in updateReservationResult:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, "Error updating reservation result");
    }
  }

  async deleteReservationResult(reservationResultID, deleteReason, user) {
    try {
      if (!user) {
        throw new APIError(401, "Authentication required");
      }

      if (!deleteReason) {
        throw new APIError(400, "Delete reason is required");
      }

      if (!mongoose.Types.ObjectId.isValid(reservationResultID)) {
        throw new APIError(400, "Invalid reservation result ID");
      }

      // Get the existing result
      const existingResult = await reservationResultRepo.findById(
        reservationResultID
      );
      if (!existingResult) {
        throw new APIError(404, "Reservation result not found");
      }

      // Get the associated reservation to check permissions
      const reservation = await reservationResultRepo.findReservationById(
        existingResult.reservationID
      );
      if (!reservation) {
        throw new APIError(404, "Related reservation not found");
      }

      // Check permissions - only the therapist who created the result or admin can delete it
      if (
        user.role !== "admin" &&
        (user.role !== "couple_therapist" ||
          reservation.coupleTherapistID.toString() !== user._id.toString())
      ) {
        throw new APIError(
          403,
          "Permission denied: You can only delete your own session results"
        );
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
        throw new APIError(404, "Failed to delete reservation result");
      }

      return updatedReservationResult;
    } catch (error) {
      console.error("Error in deleteReservationResult:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, "Error deleting reservation result");
    }
  }

  async checkDuplicate(data) {
    try {
      const existing = await reservationResultRepo.findOne({
        reservationID: data.reservationID,
        status: "completed",
      });
      return existing !== null;
    } catch (error) {
      console.error("Error checking for duplicate:", error);
      return false; // Assume no duplicate in case of error
    }
  }

  async getAllReservationResultsByUser(userID, options = {}) {
    try {
      // Check authentication
      if (!options.user) {
        throw new APIError(401, "Authentication required");
      }

      // Validate userID format
      if (!mongoose.Types.ObjectId.isValid(userID)) {
        throw new APIError(400, "Invalid user ID format");
      }

      // Check if the requesting user has permission
      if (
        options.user.role !== "admin" &&
        options.user._id.toString() !== userID &&
        options.user.role !== "member"
      ) {
        throw new APIError(
          403,
          "Permission denied: You can only access your own reservation results"
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
      let results = await reservationResultRepo.findAll(filter, skip, limit);
      const total = await reservationResultRepo.count(filter);

      // Check and update the status for each result if they are pending
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === "pending") {
          try {
            const isFinalPaid = await this.checkReservationResultFinal(
              results[i].reservationID
            );

            if (isFinalPaid) {
              // Update status to final_completed
              const updatedResult = await reservationResultRepo.updateById(
                results[i]._id,
                { status: "final_completed" }
              );

              if (updatedResult) {
                results[i] = updatedResult; // Update in our results array
                console.log(
                  `Updated reservation result ${results[i]._id} to final_completed`
                );
              }

              const updatedReservation = await reservationsRepo.updateById(
                results[i].reservationID,
                { status: "completed" }
              );

              if (updatedReservation) {
                console.log(
                  `Updated reservation ${results[i].reservationID} to completed`
                );
              }
            } else {
              console.log(
                `Reservation ${results[i].reservationID} final payment not confirmed, status remains pending`
              );
            }
          } catch (error) {
            console.error(
              `Error checking payment for reservation ${results[i].reservationID}:`,
              error
            );
            // Continue with the next result without failing the whole operation
          }
        }
      }

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
      // Check authentication
      if (!options.user) {
        throw new APIError(401, "Authentication required");
      }

      // Validate therapistID format
      if (!mongoose.Types.ObjectId.isValid(therapistID)) {
        throw new APIError(400, "Invalid therapist ID format");
      }

      // Check if the requesting user has permission
      if (
        options.user.role !== "admin" &&
        options.user._id.toString() !== therapistID &&
        options.user.role !== "couple_therapist"
      ) {
        throw new APIError(
          403,
          "Permission denied: Only therapists can access their own session results"
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
          page: parseInt(page),
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
      let results = await reservationResultRepo.findAll(filter, skip, limit);
      const total = await reservationResultRepo.count(filter);

      // Check and update the status for each result if they are pending
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === "pending") {
          try {
            const isFinalPaid = await this.checkReservationResultFinal(
              results[i].reservationID
            );

            if (isFinalPaid) {
              // Update status to final_completed
              const updatedResult = await reservationResultRepo.updateById(
                results[i]._id,
                { status: "final_completed" }
              );

              if (updatedResult) {
                results[i] = updatedResult; // Update in our results array
                console.log(
                  `Updated reservation result ${results[i]._id} to final_completed`
                );
              }

              // Also update the reservation status to completed
              const updatedReservation = await reservationsRepo.updateById(
                results[i].reservationID,
                { status: "completed" }
              );

              if (updatedReservation) {
                console.log(
                  `Updated reservation ${results[i].reservationID} to completed`
                );
              }
            } else {
              console.log(
                `Reservation ${results[i].reservationID} final payment not confirmed, status remains pending`
              );
            }
          } catch (error) {
            console.error(
              `Error checking payment for reservation ${results[i].reservationID}:`,
              error
            );
            // Continue with the next result without failing the whole operation
          }
        }
      }

      return {
        results,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Error in getAllReservationResultsByTherapist:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, "Error retrieving reservation results");
    }
  }

  async getReservationResultByReservationID(reservationID) {
    try {
      if (!mongoose.Types.ObjectId.isValid(reservationID)) {
        throw new APIError(400, "Invalid reservation ID format");
      }

      // Get the reservation
      const reservation = await reservationResultRepo.findReservationById(
        reservationID
      );
      if (!reservation) {
        throw new APIError(404, "Reservation not found");
      }

      // Get the result for this reservation, prioritizing 'completed' status results
      const result = await reservationResultRepo.findOne({
        reservationID: reservationID,
        status: "completed", // Only retrieve active results, not deleted ones
      });

      // If no completed result is found, try to find any result (including deleted)
      if (!result) {
        const anyResult = await reservationResultRepo.findOne({
          reservationID: reservationID,
        });

        if (!anyResult) {
          throw new APIError(404, "Reservation result not found");
        }

        return anyResult;
      }

      return result;
    } catch (error) {
      console.error("Error in getReservationResultByReservationID:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, "Error retrieving reservation result");
    }
  }

  async checkReservationResultFinal(reservationID) {
    const payment = await PAYMENT.findOne({ reservation: reservationID });
    console.log("Payment for reservation:", payment);

    const transaction = await TRANSACTION.find({
      payment: payment._id,
      phase: "FINAL",
      status: "PAID",
    });
    console.log("Transaction for payment:", transaction);
    return transaction.length > 0;
  }
}

module.exports = new ReservationResultService();
