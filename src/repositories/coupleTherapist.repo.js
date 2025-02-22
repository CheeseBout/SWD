const COUPLETHERAPIST = require("../models/coupleTherapist.model");

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
        "certificates.category": { $regex: category, $options: "i" },
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
}

module.exports = new TherapistRepo();
