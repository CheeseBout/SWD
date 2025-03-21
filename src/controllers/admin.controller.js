const adminServices = require("../services/admin.services");
const APIError = require("../utils/ApiError");
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

  getSumMoneyPayment = catchAsync(async (req, res) => {
    if (req.user.role !== "admin") {
      throw new APIError(401, "You are not authorized to perform this action");
    }
    const result = await adminServices.calSumRevenue();
    return OK(res, "Success", result);
  });

  getRevenueByDate = catchAsync(async (req, res) => {
    if (req.user.role !== "admin") {
      throw new APIError(401, "You are not authorized to perform this action");
    }
    const result = await adminServices.getRevenueByDate();
    return OK(res, "Success", result);
  });

  getAllTransactions = catchAsync(async (req, res) => {
    if (req.user.role !== "admin") {
      throw new APIError(401, "You are not authorized to perform this action");
    }
    const result = await adminServices.getAllTransactions();
    return OK(res, "Success", result);
  });

  getPaymentById = catchAsync(async (req, res) => {
    if (req.user.role !== "admin") {
      throw new APIError(401, "You are not authorized to perform this action");
    }
    const { paymentId } = req.params;
    const result = await adminServices.getPaymentById(paymentId);
    return OK(res, "Success", result);
  });
}

module.exports = new AdminController();
