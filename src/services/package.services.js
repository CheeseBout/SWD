const COUPLETHERAPIST = require("../models/coupleTherapist.model");
const PACKAGE = require("../models/package.model");
const packageRepo = require("../repositories/package.repo");
const APIError = require("../utils/ApiError");
const mongoose = require("mongoose");

class PackageServices {
  async createPackage(data, user) {
    // Check user role permission
    if (user.role !== "admin" && user.role !== "couple_therapist") {
      throw new APIError(403, "Permission denied");
    }

    const therapist = await COUPLETHERAPIST.findOne({ userID: user._id });

    // For couple_therapist, ensure they're creating a package for themselves
    if (user.role === "couple_therapist") {
      if (!data.coupleTherapistID) {
        data.coupleTherapistID = user.coupleTherapistID;
      } else if (
        data.coupleTherapistID.toString() !== therapist._id.toString()
      ) {
        throw new APIError(403, "You can only create packages for yourself");
      }
    }

    // Validate required fields
    if (
      !data.name ||
      !data.description ||
      !data.price ||
      !data.times ||
      !data.discount
    ) {
      throw new APIError(400, "Missing required fields");
    }

    // Check if package with same name already exists
    const existingPackage = await packageRepo.findByName(data.name);
    if (existingPackage) {
      throw new APIError(400, "Package with this name already exists");
    }

    // Create the package
    return await packageRepo.create(data);
  }

  async getAllPackage(filter = {}) {
    return await packageRepo.findAll(filter);
  }

  async getPackagesByTherapist(therapistId) {
    // Validate the therapistId
    if (!mongoose.Types.ObjectId.isValid(therapistId)) {
      throw new APIError(400, "Invalid therapist ID");
    }

    return await packageRepo.findByTherapist(therapistId);
  }

  async getPackageByID(packageID) {
    if (!mongoose.Types.ObjectId.isValid(packageID)) {
      throw new APIError(400, "Invalid package ID");
    }

    const pkg = await packageRepo.findById(packageID);
    if (!pkg) {
      throw new APIError(404, "Package not found");
    }
    return pkg;
  }

  async updatePackage(packageID, data, user) {
    // Check user role permission
    if (user.role !== "admin" && user.role !== "couple_therapist") {
      throw new APIError(403, "Permission denied");
    }

    // Validate packageID
    if (!mongoose.Types.ObjectId.isValid(packageID)) {
      throw new APIError(400, "Invalid package ID");
    }

    // Check if package exists
    const existingPackage = await packageRepo.findById(packageID);
    if (!existingPackage) {
      throw new APIError(404, "Package not found");
    }

    const therapist = await COUPLETHERAPIST.findOne({ userID: user._id });

    // For couple_therapist, ensure they're updating their own package
    if (
      user.role === "couple_therapist" &&
      existingPackage.coupleTherapistID._id.toString() !==
        therapist._id.toString()
    ) {
      throw new APIError(403, "You can only update your own packages");
    }

    // If name is changed, check for duplicates
    if (data.name && data.name !== existingPackage.name) {
      const duplicateName = await packageRepo.findByName(data.name);
      if (duplicateName && duplicateName._id.toString() !== packageID) {
        throw new APIError(400, "Package with this name already exists");
      }
    }

    // Update the package
    return await packageRepo.update(packageID, data);
  }

  async deletePackage(packageID, user) {
    // Check user role permission
    if (user.role !== "admin" && user.role !== "couple_therapist") {
      throw new APIError(403, "Permission denied");
    }

    // Validate packageID
    if (!mongoose.Types.ObjectId.isValid(packageID)) {
      throw new APIError(400, "Invalid package ID");
    }

    // Check if package exists
    const existingPackage = await packageRepo.findById(packageID);
    if (!existingPackage) {
      throw new APIError(404, "Package not found");
    }

    const therapist = await COUPLETHERAPIST.findOne({ userID: user._id });

    // For couple_therapist, ensure they're deleting their own package
    if (
      user.role === "couple_therapist" &&
      existingPackage.coupleTherapistID._id.toString() !==
        therapist._id.toString()
    ) {
      throw new APIError(403, "You can only delete your own packages");
    }

    // Soft delete the package
    return await packageRepo.update(packageID, {
      isActive: false,
      status: "inactive",
    });
  }

  // Admin only - hard delete a package (for testing)
  async hardDeletePackage(packageID, user) {
    // Only admin can hard delete
    if (user.role !== "admin") {
      throw new APIError(
        403,
        "Permission denied - only admin can perform this action"
      );
    }

    // Validate packageID
    if (!mongoose.Types.ObjectId.isValid(packageID)) {
      throw new APIError(400, "Invalid package ID");
    }

    // Check if package exists
    const existingPackage = await packageRepo.findById(packageID);
    if (!existingPackage) {
      throw new APIError(404, "Package not found");
    }

    // Hard delete the package
    return await packageRepo.delete(packageID);
  }
}

module.exports = new PackageServices();
