const RESERVATION = require("../models/reservation.model");
const COUPLETHERAPIST_AVAILABILITY = require("../models/coupleTherapistAvailability.model");
const APIError = require("../utils/ApiError");
class ReservationService {
  async createReservation(data) {
    try {
      const isDuplicate = await this.checkDuplicate(
        data.coupleTherapistID,
        data.startTime,
        data.endTime
      );
      console.log(isDuplicate);
      if (isDuplicate) {
        throw new APIError(400, "Reservation duplicate");
      }
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

  async getAllReservation() {
    try {
      return await RESERVATION.find();
    } catch (error) {
      throw new APIError(400, "Failed to get all reservation");
    }
  }

  async getReservationById(reservationID) {
    const reservation = await RESERVATION.findById({ _id: reservationID });
    // console.log(reservation);
    if (!reservation) {
      throw new APIError(404, "Reservation not found");
    }
    return reservation;
  }

  async updateReservation(id, data) {
    try {
      const reservation = await this.getReservationById(id);
      if (!reservation) {
        throw new APIError(400, "Reservation not found");
      }
      console.log("Input reservation", reservation);

      // Pass the current reservation id to exclude it from the duplicate check
      const isDuplicate = await this.checkDuplicate(
        data.coupleTherapistID,
        data.startTime,
        data.endTime,
        id // Exclude current reservation
      );

      const isOccupied = await this.checkOccupied(
        data.coupleTherapistID,
        data.startTime,
        data.endTime
      );

      if (isDuplicate) {
        throw new APIError(400, "Duplicate reservation");
      } else if (isOccupied) {
        throw new APIError(400, "Occupied");
      } else {
        const updatedReservation = await RESERVATION.findByIdAndUpdate(
          id,
          data,
          { new: true, runValidators: true }
        );
        if (!updatedReservation) {
          throw new APIError(400, "Failed to update reservation");
        }
        return updatedReservation;
      }
    } catch (error) {
      console.error("Error details: ", error);
      throw new APIError(400, "Error during update reservation");
    }
  }

  async deleteReservation(reservationID) {
    const canceledReservation = await RESERVATION.findByIdAndUpdate(
      reservationID,
      { status: "canceled" },
      { new: true, runValidators: true }
    );
    if (!canceledReservation) {
      throw new APIError(404, "Reservation not found");
    }
    return canceledReservation;
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
  async checkDuplicate(therapistID, startTime, endTime, reservationID = null) {
    // Check therapist availability
    const therapistAvailability = await COUPLETHERAPIST_AVAILABILITY.findOne({
      coupleTherapistID: therapistID,
    });

    console.log("Existed reservation: ", therapistAvailability);

    if (!therapistAvailability) {
      throw new APIError(400, "Therapist availability not found");
    }

    // Ensure the requested time does not fall into the therapist's unavailable slots
    const isUnavailable = therapistAvailability.notTimeAvailable.some(
      (slot) =>
        new Date(startTime) < new Date(slot.endHour) &&
        new Date(endTime) > new Date(slot.startHour)
    );

    if (isUnavailable) {
      throw new APIError(400, "Therapist is not available at this time");
    }

    // Check for overlapping reservations, excluding the one being updated (if provided)
    const query = {
      coupleTherapistID: therapistID,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      status: { $nin: ["canceled"] },
    };

    if (reservationID) {
      query._id = { $ne: reservationID };
    }

    const conflictingReservation = await RESERVATION.findOne(query);

    return !!conflictingReservation;
  }
}
module.exports = new ReservationService();
