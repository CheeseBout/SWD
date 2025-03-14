const adminServices = require("../services/admin.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class AdminController {
  manageCertificate = catchAsync(async (req, res) => {
    const { certificateID, action, reason } = req.body;

    const result = await adminServices.manageCertificate({
      certificateID,
      req,
      action,
      reason,
    });

    return OK(res, "Success", result);
  });

  getAllCertificateRequests = catchAsync(async (req, res) => {
    const result = await adminServices.getAllCertificateRequests(req);
    return OK(res, "Success", result);
  });
}

module.exports = new AdminController();
