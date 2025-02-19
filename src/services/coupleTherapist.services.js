const { response } = require("express");
const COUPLETHERAPIST = require("../models/coupleTherapist.model");
const COUPLETHERAPIST_AVAILABILITY = require("../models/coupleTherapistAvailability.model");
const APIError = require("../utils/ApiError");

class CoupleTherapistServices {
  async getAllCoupleTherapist() {
    return await COUPLETHERAPIST.find()
      .populate("userID", "fullname")
      .select("userID");
  }

  async getCoupleTherapistById(coupleTherapistId) {
    const data = await COUPLETHERAPIST.findOne({ _id: coupleTherapistId })
      .populate("userID", "fullname")
      .select("userID");

    if (!data) {
      throw new APIError(400, "Couple therapist not found");
    }
    return data;
  }

  async getAvailabilityById(id) {
    const data = await COUPLETHERAPIST_AVAILABILITY.findById(id)
      .populate("userID", "fullname")
      .select("userID");

    if (!data) {
      throw new APIError(400, "Couple therapist not found");
    }
    return data;
  }

  async createAvailability(coupleTherapistId, timeAvailable, notTimeAvailable) {
    // Check if any time slot in timeAvailable has endHour before startHour
    for (let i = 0; i < timeAvailable.length; i++) {
      if (
        new Date(timeAvailable[i].endHour) <=
        new Date(timeAvailable[i].startHour)
      ) {
        throw new APIError(
          400,
          `End hour of timeAvailable at index ${i} cannot be before start hour.`
        );
      }
    }

    // Check if any time slot in notTimeAvailable has endHour before startHour
    for (let i = 0; i < notTimeAvailable.length; i++) {
      if (
        new Date(notTimeAvailable[i].endHour) <=
        new Date(notTimeAvailable[i].startHour)
      ) {
        throw new APIError(
          400,
          `End hour of notTimeAvailable at index ${i} cannot be before start hour.`
        );
      }
    }

    // Check for overlapping times between timeAvailable and notTimeAvailable
    for (let i = 0; i < timeAvailable.length; i++) {
      for (let j = 0; j < notTimeAvailable.length; j++) {
        // Check if the timeAvailable slot overlaps with the notTimeAvailable slot
        if (
          new Date(timeAvailable[i].startHour) <
            new Date(notTimeAvailable[j].endHour) &&
          new Date(timeAvailable[i].endHour) >
            new Date(notTimeAvailable[j].startHour)
        ) {
          throw new APIError(
            400,
            `Overlapping time detected between timeAvailable[${i}] and notTimeAvailable[${j}].`
          );
        }
      }
    }

    // Check if availability already exists
    const isDuplicate = await this.checkExistedAvailability(
      coupleTherapistId,
      timeAvailable,
      notTimeAvailable
    );

    if (isDuplicate) {
      throw new APIError(
        400,
        "Availability already exists for this therapist."
      );
    }

    // Create new availability
    const availability = await COUPLETHERAPIST_AVAILABILITY.create({
      coupleTherapistID: coupleTherapistId,
      timeAvailable,
      notTimeAvailable,
    });

    await availability.save();
    return availability;
  }

  async updateAvailability(
    availabilityID,
    userID,
    timeAvailable,
    notTimeAvailable
  ) {
    const availability = await COUPLETHERAPIST_AVAILABILITY.findById(
      availabilityID
    );

    if (!availability) {
      throw new APIError(404, "Availability record not found");
    }

    // Validate if the provided userID matches the therapist's availability record
    const therapist = await COUPLETHERAPIST.findOne({ userID });

    if (!therapist) {
      throw new APIError(404, "Couple therapist not found");
    }

    // Ensure that the therapist is the owner of the availability record
    if (!availability.coupleTherapistID.equals(therapist._id)) {
      throw new APIError(
        403,
        "You are not authorized to update this availability"
      );
    }

    // Validate no duplicate time slots
    const isDuplicate = await this.checkExistedAvailability(
      therapist._id,
      timeAvailable || [],
      notTimeAvailable || []
    );

    if (isDuplicate) {
      throw new APIError(
        400,
        "Updated availability conflicts with an existing record."
      );
    }

    // Update availability
    availability.timeAvailable = timeAvailable;
    availability.notTimeAvailable = notTimeAvailable;
    await availability.save();

    return availability;
  }

  async deleteAvailability(availabilityId) {
    const availability = await COUPLETHERAPIST_AVAILABILITY.findByIdAndDelete(
      availabilityId
    );

    if (!availability) {
      throw new APIError(404, "Availability not found");
    }
  }

  async checkExistedAvailability(
    coupleTherapistId,
    timeAvailable,
    notTimeAvailable
  ) {
    // Find availability based on coupleTherapistId and exact matching time arrays
    const availability = await COUPLETHERAPIST_AVAILABILITY.findOne({
      coupleTherapistID: coupleTherapistId,
      "timeAvailable.startHour": timeAvailable[0].startHour,
      "timeAvailable.endHour": timeAvailable[0].endHour,
      "notTimeAvailable.startHour": notTimeAvailable[0].startHour,
      "notTimeAvailable.endHour": notTimeAvailable[0].endHour,
    });

    if (availability) {
      console.log("Availability exists:", availability);
      return availability;
    } else {
      console.log("No availability found.");
      return null;
    }
  }
}

module.exports = new CoupleTherapistServices();
