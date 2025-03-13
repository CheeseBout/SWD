const packageService = require("../services/package.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class PackageController {
  createPackage = catchAsync(async (req, res) => {
    const result = await packageService.createPackage(req.body, req.user);
    return OK(res, "Package created successfully", result);
  });

  getAllPackage = catchAsync(async (req, res) => {
    const { isActive, therapistId } = req.query;

    // If therapistId is provided, get packages by therapist
    if (therapistId) {
      const result = await packageService.getPackagesByTherapist(therapistId);
      return OK(res, "Therapist packages retrieved successfully", result);
    }

    // Otherwise, get all packages with optional filtering
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const result = await packageService.getAllPackage(filter);
    return OK(res, "Packages retrieved successfully", result);
  });

  getPackageByTherapist = catchAsync(async (req, res) => {
    const { therapistID } = req.params;
    const result = await packageService.getPackagesByTherapist(therapistID);
    return OK(res, "Therapist packages retrieved successfully", result);
  });

  getPackageByID = catchAsync(async (req, res) => {
    const { packageID } = req.params;
    const result = await packageService.getPackageByID(packageID);
    return OK(res, "Package details retrieved successfully", result);
  });

  updatePackage = catchAsync(async (req, res) => {
    const result = await packageService.updatePackage(
      req.params.packageID,
      req.body,
      req.user
    );
    return OK(res, "Package updated successfully", result);
  });

  deletePackage = catchAsync(async (req, res) => {
    const result = await packageService.deletePackage(
      req.params.packageID,
      req.user
    );
    return OK(res, "Package deleted successfully", result);
  });

  hardDeletePackage = catchAsync(async (req, res) => {
    const result = await packageService.hardDeletePackage(
      req.params.packageID,
      req.user
    );
    return OK(res, "Package permanently deleted", result);
  });
}

module.exports = new PackageController();
