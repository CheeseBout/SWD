const PACKAGE = require("../models/package.model");
const packageRepo = require("../repositories/package.repo");
const APIError = require("../utils/ApiError");
const mongoose = require("mongoose");

class PackageServices {
  async createPackage(data, user) {
    // Check user role permission - ONLY ADMIN
    if (user.role !== "admin") {
      throw new APIError(
        403,
        "Permission denied - only admin can create packages"
      );
    }

    // Validate required fields
    if (
      !data.name ||
      !data.description ||
      !data.price ||
      !data.times ||
      !data.discount ||
      !data.coupleTherapistID ||
      !data.comissionFee
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
      throw new APIError(400, "Invalid therapist ID format");
    }

    // Check if therapist exists
    const therapist = await mongoose
      .model("CoupleTherapist")
      .findById(therapistId);
    if (!therapist) {
      throw new APIError(404, "Therapist not found");
    }

    // Get all packages for this therapist
    const packages = await packageRepo.findByTherapist(therapistId);

    // Return even if empty array (no error for empty results)
    return packages;
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
    // Check user role permission - ONLY ADMIN
    if (user.role !== "admin") {
      throw new APIError(
        403,
        "Permission denied - only admin can update packages"
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
    // Check user role permission - ONLY ADMIN
    if (user.role !== "admin") {
      throw new APIError(
        403,
        "Permission denied - only admin can delete packages"
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
