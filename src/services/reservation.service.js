const RESERVATION = require("../models/reservation.model");
const COUPLETHERAPIST_AVAILABILITY = require("../models/coupleTherapistAvailability.model");
const APIError = require("../utils/ApiError");
class ReservationService {
  async createReservation(data) {
    try {
      const isOccupied = await this.checkOccupied(
        data.coupleTherapistID,
        data.startTime,
        data.endTime
      );
      console.log(isOccupied);
      if (!isOccupied) {
        const reservation = await RESERVATION.create({
          userID: data.userID,
          coupleTherapistID: data.coupleTherapistID,
          title: data.title,
          content: data.content,
          packageID: data.packageID,
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          totalPrice: data.totalPrice,
          meetingURL: data.meetingURL,
        });
        await reservation.save();

        await COUPLETHERAPIST_AVAILABILITY.updateOne(
          {
            coupleTherapistID: data.coupleTherapistID,
            "timeAvailable.startHour": { $lte: new Date(data.startTime) },
            "timeAvailable.endHour": { $gte: new Date(data.endTime) },
          },
          { $set: { "timeAvailable.$.isOccupied": true } }
        );

        return reservation;
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      throw new APIError(400, error.message || "Failed to create reservation");
    }
  }

  async getReservationById(id) {
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

  async checkOccupied(coupleTherapistID, startTime, endTime) {
    const availability = await COUPLETHERAPIST_AVAILABILITY.findOne({
      coupleTherapistID,
    });
    if (!availability) {
      throw new APIError(400, "Availability not found");
    }
    return availability.timeAvailable.some((slot) => {
      return (
        new Date(startTime) <= new Date(slot.startHour) &&
        new Date(endTime) >= new Date(slot.endHour) &&
        isOccupied === false
      );
    });
  }
  async checkDuplicate() {}
}
module.exports = new ReservationService();
