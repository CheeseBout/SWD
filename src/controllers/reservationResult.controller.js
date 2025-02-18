const reservationResultService = require("../services/reservationResult.service");
const catchAsync = require("../utils/catchAsync");

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
      await reservationResultService.getReservationResult(req.params.id)
    );
  });
  updateReservationResult = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationResultService.updateReservationResult(
        req.params.id,
        req.body
      )
    );
  });
  deleteReservationResult = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationResultService.deleteReservationResult(req.params.id)
    );
  });
  getAllReservationResult = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationResultService.getAllReservationResult()
    );
  });
}
module.exports = new ReservationResultController();
