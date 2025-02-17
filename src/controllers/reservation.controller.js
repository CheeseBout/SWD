const reservationService = require("../services/reservation.service");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class ResevationController {
  createReservation = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationService.createReservation(req.body)
    );
  });

  getReservation = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationService.getReservation(req.params.id)
    );
  });

  updateReservation = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationService.updateReservation(req.params.id, req.body)
    );
  });

  deleteReservation = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationService.deleteReservation(req.params.id)
    );
  });
}
module.exports = new ResevationController();
