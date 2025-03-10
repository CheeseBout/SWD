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

  async checkDuplicate(
    coupleTherapistID,
    startTime,
    endTime,
    reservationID = null
  ) {
    const query = {
      coupleTherapistID,
      startTime,
      endTime,
    };
    if (reservationID) {
      query._id = { $ne: reservationID };
    }
    return await RESERVATION.findOne(query);
  }

  async checkOccupied(coupleTherapistID, startTime, endTime) {
    return await RESERVATION.findOne({
      coupleTherapistID,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });
  }

  async approveReservation(reservationID) {
    return await RESERVATION.findByIdAndUpdate(
      reservationID,
      { status: "confirmed" },
      { new: true }
    );
  }

  async denyReservation(reservationID, reason) {
    return await RESERVATION.findByIdAndUpdate(
      reservationID,
      { status: "denied", reason: reason },
      { new: true }
    );
  }
}

module.exports = new ReservationRepo();
