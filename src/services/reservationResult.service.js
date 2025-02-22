const RESERVATIONRESULT = require("../models/reservation-result.model");
const RESERVATION = require("../models/reservation.model");
const APIError = require("../utils/ApiError");
class ReservationResultService {
  async createReservationResult(data) {
    if (!(await RESERVATION.findById(data.reservationID))) {
      throw new APIError(400, "Reservation not found");
    }
    if (await this.checkDuplicate(data)) {
      throw new APIError(400, "Reservation result duplicated");
    }
    const reservationResult = await RESERVATIONRESULT.create({
      reservationID: data.reservationID,
      questions: data.questions,
      answers: data.answers,
      status: "completed",
      deleteReason: null,
    });
    await reservationResult.save();
    return reservationResult;
  }
  async getReservationResult(reservationResultID) {
    const response = await RESERVATIONRESULT.findById(reservationResultID);
    if (!response) {
      throw new APIError(400, "Reservation result not found");
    }
    return response;
  }
  async updateReservationResult(reservationResultID, data) {
    const updatedReservationResult = await RESERVATIONRESULT.findByIdAndUpdate(
      reservationResultID,
      { $set: { questions: data.questions, answers: data.answers } },
      { new: true, runValidators: true }
    );

    if (!updatedReservationResult) {
      throw new APIError(404, "Reservation result not found");
    }
  }
  async deleteReservationResult(reservationResultID, deleteReason) {
    if (!deleteReason) {
      throw new APIError(400, "Delete reason is required");
    }

    // Find the reservation result and update status to 'deleted' along with the delete reason
    const updatedReservationResult = await RESERVATIONRESULT.findByIdAndUpdate(
      reservationResultID,
      {
        status: "deleted",
        deleteReason: deleteReason,
      },
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure validation is run during the update
      }
    );

    if (!updatedReservationResult) {
      throw new APIError(404, "Reservation result not found");
    }

    return updatedReservationResult;
  }

  async getAllReservationResult() {
    return await RESERVATIONRESULT.find();
  }
  async checkDuplicate(data) {
    const existing = await RESERVATIONRESULT.findOne({
      questions: { $eq: data.questions },
      answers: { $eq: data.answers },
      status: "completed",
      deleteReason: data.deleteReason || null,
    });
    return existing !== null;
  }
}
module.exports = new ReservationResultService();
