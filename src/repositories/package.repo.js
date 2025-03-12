const PACKAGE = require("../models/package.model");

class PackageRepository {
  async create(packageData) {
    const newPackage = new PACKAGE(packageData);
    return await newPackage.save();
  }

  async findAll(filter = {}) {
    try {
      // Remove the sorting that's causing issues with CosmosDB
      return await PACKAGE.find(filter).populate({
        path: "coupleTherapistID",
        select: "userID description",
        populate: {
          path: "userID",
          select: "fullname photoURL email",
        },
      });
    } catch (error) {
      console.error("Error in findAll:", error);
      throw error;
    }
  }

  async findById(id) {
    try {
      return await PACKAGE.findById(id).populate({
        path: "coupleTherapistID",
        select: "userID description",
        populate: {
          path: "userID",
          select: "fullname photoURL email",
        },
      });
    } catch (error) {
      console.error("Error in findById:", error);
      throw error;
    }
  }

  async findByName(name) {
    try {
      return await PACKAGE.findOne({ name });
    } catch (error) {
      console.error("Error in findByName:", error);
      throw error;
    }
  }

  async findByTherapist(therapistId, includeInactive = false) {
    try {
      const filter = { coupleTherapistID: therapistId };

      // Only include active packages unless specifically requested to include inactive ones
      if (!includeInactive) {
        filter.isActive = true;
      }

      return await PACKAGE.find(filter).populate({
        path: "coupleTherapistID",
        select: "userID description",
        populate: {
          path: "userID",
          select: "fullname photoURL email",
        },
      });
    } catch (error) {
      console.error("Error in findByTherapist:", error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      return await PACKAGE.findByIdAndUpdate(id, updateData, {
        new: true,
      }).populate({
        path: "coupleTherapistID",
        select: "userID description",
        populate: {
          path: "userID",
          select: "fullname photoURL email",
        },
      });
    } catch (error) {
      console.error("Error in update:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      // Hard delete - only for admin testing purposes
      return await PACKAGE.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error in delete:", error);
      throw error;
    }
  }
}

module.exports = new PackageRepository();
