const RESERVATIONRESULT = require("../models/reservation-result.model");
const RESERVATION = require("../models/reservation.model");
const { default: mongoose } = require("mongoose");

class ReservationResultRepo {
  async create(data) {
    return await RESERVATIONRESULT.create(data);
  }

  async findById(id) {
    return await RESERVATIONRESULT.findById(id);
  }

  async updateById(id, data) {
    return await RESERVATIONRESULT.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id) {
    return await RESERVATIONRESULT.findByIdAndDelete(id);
  }

  async findOne(query) {
    return await RESERVATIONRESULT.findOne(query);
  }

  async findAll(filter = {}, skip = 0, limit = 10) {
    try {
      // Add proper MongoDB sorting by updatedAt
      const results = await RESERVATIONRESULT.find(filter)
        .populate({
          path: "reservationID",
          populate: [
            { path: "userID", select: "fullname photoURL" },
            { path: "coupleTherapistID", select: "fullname photoURL" },
            { path: "packageID", select: "name price" },
          ],
        })
        .sort({ updatedAt: -1 }) // Sort by updatedAt in descending order
        .skip(skip)
        .limit(limit)
        .lean(); // Use lean() to convert to plain JavaScript objects

      return results;
    } catch (error) {
      console.error("Error in findAll method:", error);
      return [];
    }
  }

  async count(filter = {}) {
    try {
      return await RESERVATIONRESULT.countDocuments(filter);
    } catch (error) {
      console.error("Error in count method:", error);
      return 0;
    }
  }

  async findReservationsByUser(userID) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userID)) {
        return [];
      }

      // Make sure we're using the correct field name in the Reservation model
      return await RESERVATION.find({
        userID: new mongoose.Types.ObjectId(userID),
      })
        .select("_id")
        .lean();
    } catch (error) {
      console.error("Error in findReservationsByUser:", error);
      return [];
    }
  }

  async findReservationsByTherapist(coupleTherapistID) {
    try {
      if (!mongoose.Types.ObjectId.isValid(coupleTherapistID)) {
        return [];
      }

      return await RESERVATION.find({
        coupleTherapistID: new mongoose.Types.ObjectId(coupleTherapistID),
      })
        .select("_id")
        .lean();
    } catch (error) {
      console.error("Error in findReservationsByTherapist:", error);
      return [];
    }
  }

  async findReservationById(reservationID) {
    try {
      return await RESERVATION.findById(reservationID);
    } catch (error) {
      console.error("Error in findReservationById:", error);
      return null;
    }
  }
}

module.exports = new ReservationResultRepo();
