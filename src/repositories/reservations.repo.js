const RESERVATION = require("../models/reservation.model");

class ReservationRepo {
  async getAll(filter, options) {
    return await RESERVATION.paginate(filter, options);
  }

  async createReservation(reservationData) {
    const reservation = await RESERVATION.create(reservationData);
    return await reservation.save();
  }

  async getReservationById(id) {
    return await RESERVATION.findById(id)
      .populate("userID", "fullname")
      .populate("coupleTherapistID", "fullname")
      .populate("packageID", "name price");
  }

  async updateReservation(id, updateData) {
    return await RESERVATION.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteReservation(id) {
    return await RESERVATION.findByIdAndDelete(id);
  }

  async findExistingReservation(userID, therapistID, startTime, endTime) {
    return await RESERVATION.findOne({
      userID,
      coupleTherapistID: therapistID,
      startTime,
      endTime,
    });
  }
  async approveReservation(reservationID) {
    return await RESERVATION.findByIdAndUpdate(
      reservationID,
      { status: "approved" },
      { new: true }
    );
  }
  async denyReservation(reservationID) {
    return await RESERVATION.findByIdAndUpdate(
      reservationID,
      { status: "denied" },
      { new: true }
    );
  }
}

module.exports = new ReservationRepo();
