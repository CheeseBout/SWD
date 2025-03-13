const CERTIFICATE = require("../models/certificate.model");
const COUPLETHERAPIST = require("../models/coupleTherapist.model");
const COUPLETHERAPIST_AVAILABILITY = require("../models/coupleTherapistAvailability.model");

class TherapistRepo {
  async getAll(filter, options) {
    return await COUPLETHERAPIST.paginate(filter, options);
  }

  async searchTherapists(searchParams) {
    const { category, searchName } = searchParams;

    let pipeline = [
      // Lookup to join with Users collection
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      // Unwind the userInfo array
      {
        $unwind: "$userInfo",
      },
    ];

    // Match conditions
    let matchConditions = {};
    let conditions = [];

    if (category) {
      conditions.push({
        $or: [
          {
            certificates: {
              $elemMatch: {
                category: { $regex: category, $options: "i" },
                status: "approved",
                isCertificateVerified: true,
              },
            },
          },
          {
            category: { $regex: category, $options: "i" },
          },
        ],
      });
    }

    if (searchName) {
      conditions.push({
        "userInfo.fullname": { $regex: searchName, $options: "i" },
      });
    }

    if (conditions.length > 0) {
      matchConditions.$and = conditions;
      pipeline.push({
        $match: matchConditions,
      });
    }

    return await COUPLETHERAPIST.aggregate(pipeline);
  }
  async updateTherapistCertificate(certificateID, userId) {
    await CERTIFICATE.findOneAndUpdate(
      { _id: certificateID },
      { isCertificateVerified: true, status: "approved", reason: "" }
    );
    return await COUPLETHERAPIST.findOneAndUpdate(
      { "certificates.certificateID": certificateID },
      {
        $set: {
          "certificates.$[cert].isCertificateVerified": true,
          "certificates.$[cert].reason": "",
          "certificates.$[cert].status": "approved",
          "certificates.$[cert].processedAt": new Date(),
          "certificates.$[cert].processedBy": userId,
        },
      },
      {
        arrayFilters: [{ "cert.certificateID": certificateID }],
        new: true,
      }
    );
  }

  async getAvailabilityById(therapistId) {
    // Modified to find all availability records for a therapist
    return await COUPLETHERAPIST_AVAILABILITY.find({
      coupleTherapistID: therapistId,
    }).select(
      "coupleTherapistID timeAvailable notTimeAvailable createdAt updatedAt"
    );
  }

  async createAvailability(coupleTherapistId, timeAvailable, notTimeAvailable) {
    const availability = await COUPLETHERAPIST_AVAILABILITY.create({
      coupleTherapistID: coupleTherapistId,
      timeAvailable,
      notTimeAvailable,
    });
    return await availability.save();
  }

  async findExistingAvailability(
    coupleTherapistId,
    timeAvailable,
    notTimeAvailable
  ) {
    return await COUPLETHERAPIST_AVAILABILITY.findOne({
      coupleTherapistID: coupleTherapistId,
      "timeAvailable.startHour": timeAvailable[0].startHour,
      "timeAvailable.endHour": timeAvailable[0].endHour,
      "notTimeAvailable.startHour": notTimeAvailable[0].startHour,
      "notTimeAvailable.endHour": notTimeAvailable[0].endHour,
    });
  }

  async updateAvailability(availabilityId, updateData) {
    return await COUPLETHERAPIST_AVAILABILITY.findByIdAndUpdate(
      availabilityId,
      updateData,
      { new: true }
    );
  }

  async findOne(filter) {
    return await COUPLETHERAPIST.findOne(filter);
  }

  async deleteAvailability(availabilityId) {
    return await COUPLETHERAPIST_AVAILABILITY.findByIdAndDelete(availabilityId);
  }

  async findTherapistByCertificateId(certificateId) {
    return await COUPLETHERAPIST.findOne({
      "certificates.certificateID": certificateId,
    });
  }

  async getCoupleTherapistIdByUserId(userId) {
    return await COUPLETHERAPIST.findOne({ userID: userId });
  }
}

module.exports = new TherapistRepo();
