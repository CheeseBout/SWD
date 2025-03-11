const COUPLETHERAPIST_AVAILABILITY = require("../models/coupleTherapistAvailability.model");
const RESERVATION = require("../models/reservation.model");
const USER = require("../models/user.model");

class ReservationRepo {
  async getAll(filter, options) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const reservations = await RESERVATION.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("userID", "fullname")
      .populate("coupleTherapistID", "fullname")
      .populate("packageID", "name price");
    const total = await RESERVATION.countDocuments(filter);
    return {
      reservations,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
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
    return await RESERVATION.findByIdAndUpdate(
      id,
      { status: "canceled" },
      { new: true }
    );
  }

  async findExistingReservation(userID, therapistID, startTime, endTime) {
    return await RESERVATION.findOne({
      userID,
      coupleTherapistID: therapistID,
      startTime,
      endTime,
    });
  }

  async approveReservation(reservationID, price) {
    return await RESERVATION.findByIdAndUpdate(
      reservationID,
      { status: "confirmed", totalPrice: price },
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

  async checkDuplicate(therapistID, startTime, endTime, reservationID) {
    return await RESERVATION.findOne({
      coupleTherapistID: therapistID,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      _id: { $ne: reservationID },
    });
  }

  async checkOccupied(therapistID, startTime, endTime) {
    const availability = await COUPLETHERAPIST_AVAILABILITY.findOne({
      coupleTherapistID: therapistID,
    });

    if (!availability) {
      throw new Error("Therapist availability not found");
    }

    // Convert startTime and endTime to Date objects
    startTime = new Date(startTime);
    endTime = new Date(endTime);

    console.log("Availability", availability);
    console.log("Input start time:", startTime);
    console.log("Input end time:", endTime);

    // Check if the time exactly matches any of the timeAvailable slots and is not occupied
    let isAvailable = false;
    let availableSlot = null;

    for (const available of availability.timeAvailable) {
      console.log("Checking available slot:", available);
      console.log("Available start hour:", available.startHour);
      console.log("Available end hour:", available.endHour);

      // Check if startTime and endTime exactly match the timeAvailable slot
      const startTimeMatches =
        startTime.getTime() === available.startHour.getTime();
      const endTimeMatches = endTime.getTime() === available.endHour.getTime();

      console.log("Start time matches:", startTimeMatches);
      console.log("End time matches:", endTimeMatches);

      if (startTimeMatches && endTimeMatches && !available.isOccupied) {
        console.log("Found exact match and slot is not occupied!");
        isAvailable = true;
        availableSlot = available;
        break;
      }
    }

    if (isAvailable) {
      console.log("Time slot is available and matches exactly");
      return { isOccupied: false, availableSlot };
    } else {
      console.log("Time slot is not available or doesn't match exactly");
      return { isOccupied: true, availableSlot: null };
    }
  }

  async updateAvailability(
    therapistID,
    startTime,
    endTime,
    availableSlot = null
  ) {
    const availability = await COUPLETHERAPIST_AVAILABILITY.findOne({
      coupleTherapistID: therapistID,
    });

    if (!availability) {
      throw new Error("Therapist availability not found");
    }

    // Convert startTime and endTime to Date objects
    startTime = new Date(startTime);
    endTime = new Date(endTime);

    console.log(
      "Updating availability for slot with start:",
      startTime,
      "end:",
      endTime
    );

    if (availableSlot) {
      // If an available slot was provided, update it directly
      for (const available of availability.timeAvailable) {
        if (available._id.toString() === availableSlot._id.toString()) {
          console.log("Updating specific slot:", available);
          available.isOccupied = true;
          break;
        }
      }
    } else {
      // Otherwise find by matching start and end times exactly
      for (const available of availability.timeAvailable) {
        const startTimeMatches =
          startTime.getTime() === available.startHour.getTime();
        const endTimeMatches =
          endTime.getTime() === available.endHour.getTime();

        if (startTimeMatches && endTimeMatches) {
          console.log("Found matching slot to update:", available);
          available.isOccupied = true;
          break;
        }
      }
    }

    await availability.save();
    console.log("Availability updated successfully");
  }

  async findUserEmail(userID) {
    return await USER.findById(userID).select("email");
  }

  async revertAvailability(therapistID, startTime, endTime) {
    const availability = await COUPLETHERAPIST_AVAILABILITY.findOne({
      coupleTherapistID: therapistID,
    });

    if (!availability) {
      console.log("Therapist availability not found for:", therapistID);
      throw new Error("Therapist availability not found");
    }

    // Convert startTime and endTime to Date objects
    startTime = new Date(startTime);
    endTime = new Date(endTime);

    console.log(
      "Reverting availability for therapist:",
      therapistID,
      "start:",
      startTime,
      "end:",
      endTime
    );

    let foundMatch = false;
    // Find by matching start and end times exactly
    for (const available of availability.timeAvailable) {
      const startTimeMatches =
        startTime.getTime() === available.startHour.getTime();
      const endTimeMatches = endTime.getTime() === available.endHour.getTime();

      console.log(
        "Checking slot:",
        available,
        "startMatches:",
        startTimeMatches,
        "endMatches:",
        endTimeMatches
      );

      if (startTimeMatches && endTimeMatches) {
        console.log("Found matching slot to revert:", available);
        available.isOccupied = false;
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      console.log("No exact matching time slot found. Trying partial match...");

      // If no exact match, try to find a slot that contains the time range
      for (const available of availability.timeAvailable) {
        if (startTime >= available.startHour && endTime <= available.endHour) {
          console.log("Found containing slot to revert:", available);
          available.isOccupied = false;
          foundMatch = true;
          break;
        }
      }
    }

    if (!foundMatch) {
      console.log("No matching time slot found for reverting availability");
    } else {
      await availability.save();
      console.log("Availability reverted successfully");
    }

    return foundMatch;
  }
}

module.exports = new ReservationRepo();
