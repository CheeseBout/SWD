const reservationResultRepo = require("../repositories/reservationResult.repo");
const RESERVATION = require("../models/reservation.model");
const APIError = require("../utils/ApiError");

class ReservationResultService {
  async createReservationResult(data) {
    if (req.user.role !== "couple_therapist") {
      throw new APIError(403, "Permission denied");
    }
    // Validate reservation exists
    if (!(await RESERVATION.findById(data.reservationID))) {
      throw new APIError(400, "Reservation not found");
    }

    // Check if the result is a duplicate
    if (await this.checkDuplicate(data)) {
      throw new APIError(400, "Reservation result duplicated");
    }

    // Create new reservation result using the repo
    const reservationResult = await reservationResultRepo.create({
      reservationID: data.reservationID,
      questions: data.questions,
      answers: data.answers,
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
    if (req.user.role !== "couple_therapist") {
      throw new APIError(403, "Permission denied");
    }
    const updatedReservationResult = await reservationResultRepo.updateById(
      reservationResultID,
      { questions: data.questions, answers: data.answers }
    );

    if (!updatedReservationResult) {
      throw new APIError(404, "Reservation result not found");
    }
  }

  async deleteReservationResult(reservationResultID, deleteReason) {
    if (req.user.role !== "couple_therapist") {
      throw new APIError(403, "Permission denied");
    }
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

  async getAllReservationResults() {
    return await reservationResultRepo.findAll();
  }

  async checkDuplicate(data) {
    const existing = await reservationResultRepo.findOne({
      questions: { $eq: data.questions },
      answers: { $eq: data.answers },
      status: "completed",
      deleteReason: data.deleteReason || null,
    });
    return existing !== null;
  }
}

module.exports = new ReservationResultService();
