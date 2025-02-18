const RESERVATION = require("../models/reservation.model");

const APIError = require("../utils/ApiError");
class ReservationService {
  async createReservation(data) {
    try {
      const reservation = new RESERVATION(data);
      await reservation.save();
      return reservation;
    } catch (error) {
      throw new APIError(400, "Failed to create reservation");
    }
  }
  async getReservation(id) {
    const reservation = await RESERVATION.findById(id);
    if (!reservation) {
      throw new APIError(404, "Reservation not found");
    }
    return reservation;
  }
  async updateReservation(id, data) {
    const updatedReservation = await RESERVATION.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updatedReservation) {
      throw new APIError(404, "Reservation not found");
    }
    return updatedReservation;
  }
  async deleteReservation(id) {
    const deletedReservation = await RESERVATION.findByIdAndUpdate(id);
    if (!deletedReservation) {
      throw new APIError(404, "Reservation not found");
    }
  }
}
module.exports = new ReservationService();
