const paymentServices = require("../services/payment.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class PaymentController {
  //Payment
  getAllPayments = catchAsync(async (req, res) => {
    return OK(res, "Success", await paymentServices.getAllPayments());
  });

  createPayment = catchAsync(async (req, res) => {
    const { reservationID, totalAmount } = req.body;

    return OK(
      res,
      "Success",
      await paymentServices.createPayment(reservationID, totalAmount)
    );
  });

  createPaymentUrl = catchAsync(async (req, res) => {
    const { reservationID, phase, ipAddr } = req.body;
    return OK(
      res,
      "Success",
      await paymentServices.createPaymentUrl(reservationID, phase, ipAddr)
    );
  });

  verifyPayment = catchAsync(async (req, res) => {
    return OK(res, "Success", await paymentServices.verifyPayment(req));
  });

  //Transaction
  getTransactionsByPayment = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await paymentServices.getTransactionsByPayment(req)
    );
  });
}

module.exports = new PaymentController();
