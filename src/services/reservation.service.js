const APIError = require("../utils/ApiError");
const reservationsRepo = require("../repositories/reservations.repo");
const mongoose = require("mongoose");

class ReservationService {
  async getAllReservations(filter) {
    return await reservationsRepo.getAll(filter, {});
  }

  async getReservationById(reservationID) {
    const reservation = await reservationsRepo.getReservationById(
      reservationID
    );
    if (!reservation) throw new APIError(404, "Reservation not found");
    return reservation;
  }

  async createReservation(req) {
    const data = req.body;
    if (req.user.role !== "member") {
      throw new APIError(403, "Permission denied");
    }

    // Validate and convert IDs to ObjectId
    if (!mongoose.Types.ObjectId.isValid(data.userID)) {
      throw new APIError(400, "Invalid userId");
    }
    if (!mongoose.Types.ObjectId.isValid(data.coupleTherapistID)) {
      throw new APIError(400, "Invalid coupleTherapistID");
    }
    data.userID = new mongoose.Types.ObjectId(data.userID);
    data.coupleTherapistID = new mongoose.Types.ObjectId(
      data.coupleTherapistID
    );

    const isDuplicate = await reservationsRepo.checkDuplicate(
      data.coupleTherapistID,
      data.startTime,
      data.endTime
    );
    if (isDuplicate) throw new APIError(400, "Duplicate reservation");

    // Check if the time slot is available
    const availabilityCheck = await reservationsRepo.checkOccupied(
      data.coupleTherapistID,
      data.startTime,
      data.endTime
    );

    console.log("Availability check result:", availabilityCheck);

    if (availabilityCheck.isOccupied) {
      throw new APIError(
        400,
        "Therapist is not available at the requested time"
      );
    }

    try {
      // Create the reservation
      const reservation = await reservationsRepo.createReservation(data);
      console.log("Reservation created successfully:", reservation);

      // Update availability status to occupied
      await reservationsRepo.updateAvailability(
        data.coupleTherapistID,
        data.startTime,
        data.endTime,
        availabilityCheck.availableSlot
      );

      return reservation;
    } catch (error) {
      console.error("Error creating reservation:", error);
      throw new APIError(500, `Error creating reservation: ${error.message}`);
    }
  }

  async updateReservation(req) {
    const { reservationID } = req.params;
    const data = req.body;
    if (req.user.role !== "member") {
      throw new APIError(403, "Permission denied");
    }

    // Validate and convert IDs to ObjectId
    if (!mongoose.Types.ObjectId.isValid(data.coupleTherapistID)) {
      throw new APIError(400, "Invalid coupleTherapistID");
    }
    data.coupleTherapistID = new mongoose.Types.ObjectId(
      data.coupleTherapistID
    );

    const reservation = await this.getReservationById(reservationID);
    if (!reservation) throw new APIError(404, "Reservation not found");

    const isDuplicate = await reservationsRepo.checkDuplicate(
      data.coupleTherapistID,
      data.startTime,
      data.endTime,
      reservationID
    );
    if (isDuplicate) throw new APIError(400, "Duplicate reservation");

    return await reservationsRepo.updateReservation(reservationID, data);
  }

  async cancelReservation(reservationID, user) {
    if (user.role !== "member") {
      throw new APIError(403, "Permission denied");
    }
    const canceledReservation = await reservationsRepo.deleteReservation(
      reservationID
    );
    if (!canceledReservation) throw new APIError(404, "Reservation not found");
    return canceledReservation;
  }

  async approveReservation(reservationID, price, user) {
    if (user.role !== "couple_therapist") {
      throw new APIError(403, "Permission denied");
    }
    const reservation = await reservationsRepo.approveReservation(
      reservationID,
      price
    );
    if (!reservation) throw new APIError(404, "Reservation not found");
    return reservation;
  }

  async denyReservation(reservationID, reason, user) {
    if (user.role !== "couple_therapist") {
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
