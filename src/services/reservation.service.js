const APIError = require("../utils/ApiError");
const reservationsRepo = require("../repositories/reservations.repo");

class ReservationService {
  async getAllReservations(filter) {
    return await reservationsRepo.getAll(filter, {});
  }

  async getReservationById(reservationID) {
    const reservation = await reservationsRepo.getById(reservationID);
    if (!reservation) throw new APIError(404, "Reservation not found");
    return reservation;
  }

  async createReservation(data) {
    if (req.user.role !== "member") {
      throw new APIError(403, "Permission denied");
    }
    const isDuplicate = await reservationsRepo.checkDuplicate(
      data.coupleTherapistID,
      data.startTime,
      data.endTime
    );
    if (isDuplicate) throw new APIError(400, "Duplicate reservation");

    const isOccupied = await reservationsRepo.checkOccupied(
      data.coupleTherapistID,
      data.startTime,
      data.endTime
    );
    if (!isOccupied) {
      return await reservationsRepo.create(data);
    }
    throw new APIError(400, "Therapist is not available");
  }

  async updateReservation(id, data) {
    if (req.user.role !== "member") {
      throw new APIError(403, "Permission denied");
    }
    const reservation = await this.getReservationById(id);
    if (!reservation) throw new APIError(404, "Reservation not found");

    const isDuplicate = await reservationsRepo.checkDuplicate(
      data.coupleTherapistID,
      data.startTime,
      data.endTime,
      id
    );
    if (isDuplicate) throw new APIError(400, "Duplicate reservation");

    return await reservationsRepo.update(id, data);
  }

  async cancelReservation(reservationID) {
    if (req.user.role !== "member") {
      throw new APIError(403, "Permission denied");
    }
    const canceledReservation = await reservationsRepo.cancel(reservationID);
    if (!canceledReservation) throw new APIError(404, "Reservation not found");
    return canceledReservation;
  }

  async approveReservation(reservationID) {
    if (req.user.role !== "couple_therapist") {
      throw new APIError(403, "Permission denied");
    }
    const reservation = await reservationsRepo.approveReservation(
      reservationID
    );
    if (!reservation) throw new APIError(404, "Reservation not found");
    return reservation;
  }

  async denyReservation(reservationID, reason) {
    if (req.user.role !== "couple_therapist") {
      throw new APIError(403, "Permission denied");
    }
    if (!reason) throw new APIError(400, "Reason is required");
    const reservation = await reservationsRepo.denyReservation(
      reservationID,
      reason
    );
    if (!reservation) throw new APIError(404, "Reservation not found");
    return reservation;
  }
}

module.exports = new ReservationService();
