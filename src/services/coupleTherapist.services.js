const COUPLETHERAPIST = require("../models/coupleTherapist.model");
const COUPLETHERAPIST_AVAILABILITY = require("../models/coupleTherapistAvailability.model");
const APIError = require("../utils/ApiError");
const therapistRepo = require("../repositories/coupleTherapist.repo");

class CoupleTherapistServices {
  async getAllCoupleTherapist(req) {
    try {
      const filterQuery = req.query;
      const therapists = await therapistRepo.searchTherapists(filterQuery);
      //Filter verified therapists
      const verifiedTherapist = therapists.filter(
        (therapist) =>
          therapist.certificates.filter(
            (certificate) => certificate.isCertificateVerified === true
          ).length > 0
      );

      console.log("verifiedTherapist", verifiedTherapist);
      return verifiedTherapist;
    } catch (error) {
      throw new APIError(404, "No verified couple therapist found");
    }
  }

  async getCoupleTherapistIdByUserId(userId) {
    const coupleTherapist = await therapistRepo.getCoupleTherapistIdByUserId(
      userId
    );

    if (!coupleTherapist) {
      throw new APIError(404, "Couple therapist not found");
    }

    return coupleTherapist;
  }

  async getCoupleTherapistById(coupleTherapistId) {
    const data = await COUPLETHERAPIST.findOne({ _id: coupleTherapistId });

    if (!data) {
      throw new APIError(400, "Couple therapist not found");
    }
    return data;
  }

  async getAvailabilityById(therapistId) {
    const availability = await therapistRepo.getAvailabilityById(therapistId);

    if (!availability || availability.length === 0) {
      throw new APIError(404, "No availability found for this therapist");
    }

    // Get therapist details to include in response
    const therapist = await COUPLETHERAPIST.findById(therapistId).populate(
      "userID",
      "fullname photoURL email"
    );

    if (!therapist) {
      throw new APIError(404, "Therapist not found");
    }

    // Format the response with therapist details and availability
    return {
      therapist: {
        _id: therapist._id,
        userInfo: therapist.userID,
        description: therapist.description,
        specialization: therapist.specialization,
      },
      availability: availability,
    };
  }

  async createAvailability(coupleTherapistId, timeAvailable) {
    // Validate time slots
    this.validateTimeSlots(timeAvailable);

    // Check for existing availability
    const isDuplicate = await therapistRepo.findExistingAvailability(
      coupleTherapistId,
      timeAvailable
    );

    if (isDuplicate) {
      throw new APIError(
        400,
        "Availability already exists for this therapist."
      );
    }

    return await therapistRepo.createAvailability(
      coupleTherapistId,
      timeAvailable
    );
  }

  async updateAvailability(availabilityID, coupleTherapistId, timeAvailable) {
    // Remove notTimeAvailable
    const availability = await therapistRepo.getAvailabilityById(
      availabilityID
    );
    if (!availability) {
      throw new APIError(404, "Availability record not found");
    }

    // Validate time slots without notTimeAvailable
    this.validateTimeSlots(timeAvailable);

    const updateData = {
      timeAvailable,
    };

    return await therapistRepo.updateAvailability(availabilityID, updateData);
  }

  async deleteAvailability(availabilityId) {
    const result = await therapistRepo.deleteAvailability(availabilityId);
    if (!result) {
      throw new APIError(404, "Availability not found");
    }
  }

  validateTimeSlots(timeAvailable) {
    // Validate time slots logic - remove notTimeAvailable checks
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

    // Check for overlapping timeAvailable slots
    for (let i = 0; i < timeAvailable.length; i++) {
      for (let j = i + 1; j < timeAvailable.length; j++) {
        if (
          new Date(timeAvailable[i].startHour) <
            new Date(timeAvailable[j].endHour) &&
          new Date(timeAvailable[i].endHour) >
            new Date(timeAvailable[j].startHour)
        ) {
          throw new APIError(
            400,
            `Overlapping time detected between timeAvailable[${i}] and timeAvailable[${j}].`
          );
        }
      }
    }
  }
}
module.exports = new CoupleTherapistServices();
