const reservationResultService = require("../services/reservationResult.service");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class ReservationResultController {
  createReservationResult = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationResultService.createReservationResult(req.body)
    );
  });
  getReservationResult = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationResultService.getReservationResult(
        req.params.reservationResultID
      )
    );
  });
  updateReservationResult = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationResultService.updateReservationResult(
        req.params.reservationResultID,
        req.body
      )
    );
  });
  deleteReservationResult = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationResultService.deleteReservationResult(
        req.params.reservationResultID,
        req.body.deleteReason
      )
    );
  });
  getAllReservationResult = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationResultService.getAllReservationResults()
    );
  });
}
module.exports = new ReservationResultController();
