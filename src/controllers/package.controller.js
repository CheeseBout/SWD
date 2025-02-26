const packageService = require("../services/package.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class PackageController {
  createPackage = catchAsync(async (req, res) => {
    return OK(res, "Success", await packageService.createPackage(req.body));
  });
  getAllPackage = catchAsync(async (req, res) => {
    return OK(res, "Success", await packageService.getAllPackage());
  });
  getPackageByID = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await packageService.getPackageByID(req.params.packageID)
    );
  });
  updatePackage = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await packageService.updatePackage(req.params.packageID, req.body)
    );
  });
  deletePackage = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await packageService.deletePackage(req.params.packageID)
    );
  });
}

module.exports = new PackageController();
