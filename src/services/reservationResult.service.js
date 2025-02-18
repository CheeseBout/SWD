const RESERVATIONRESULT = require("../models/reservation-result.model");
const APIError = require("../utils/ApiError");
class ReservationResultService {
  async createReservationResult(data) {
    try {
      const reservationResult = await RESERVATIONRESULT.create(data);
      await reservationResult.save();
      return reservationResult;
    } catch (error) {
      throw new APIError(400, "Failed to create reservation result");
    }
  }
  async getReservationResult(id) {
    return await RESERVATIONRESULT.findById(id);
  }
  async updateReservationResult(id, data) {
    const updatedReservationResult = await RESERVATIONRESULT.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedReservationResult) {
      throw new APIError(404, "Reservation result not found");
    }
  }
  async deleteReservationResult(id) {}
  async getAllReservationResult() {
    return await RESERVATIONRESULT.find();
  }
}
module.exports = new ReservationResultService();
