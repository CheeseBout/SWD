const adminServices = require("../services/admin.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class AdminController {
  approveCertificate = catchAsync(async (req, res) => {
    const result = await adminServices.approveCertificate(req.body);
    return OK(res, "Certificate approved successfully", result);
  });
}

module.exports = new AdminController();
