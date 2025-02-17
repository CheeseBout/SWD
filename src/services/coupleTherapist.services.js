const COUPLETHERAPIST = require("../models/coupleTherapist.model");
const COUPLETHERAPIST_AVAILABILITY = require("../models/coupleTherapistAvailability.model");
const APIError = require("../utils/ApiError");
class CoupleTherapistServices {
  async getAllCoupleTherapist() {
    return await COUPLETHERAPIST.find();
  }

  async getCoupleTherapistById(coupleTherapistId) {
    const data = await COUPLETHERAPIST.findOne({
      userID: new Object(coupleTherapistId),
    });
    if (!data) {
      throw new APIError(400, "Couple therapist not found");
    }
    return data;
  }

  async getAvailability(id) {
    return await COUPLETHERAPIST_AVAILABILITY.findById(id);
  }

  async createAvailability(id, timeAvailable, notTimeAvailable) {
    const therapist = await this.getCoupleTherapistById(id);

    if (!therapist) {
      throw new APIError(404, "Couple therapist not found");
    }

    const availability = await COUPLETHERAPIST_AVAILABILITY.create({
      coupleTherapistID: therapist._id,
      timeAvailable,
      notTimeAvailable,
    });

    await availability.save();

    return availability;
  }

  async updateAvailability(availabilityId, updateData) {
    const availability = await COUPLETHERAPIST_AVAILABILITY.findById(
      availabilityId
    );

    if (!availability) {
      throw new APIError(404, "Availability record not found");
    }

    Object.assign(availability, updateData);
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
}
module.exports = new CoupleTherapistServices();
