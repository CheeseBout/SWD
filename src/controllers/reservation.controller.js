const reservationService = require("../services/reservation.service");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class ReservationController {
  createReservation = catchAsync(async (req, res) => {
    const result = await reservationService.createReservation(req);
    return OK(res, "Success", result);
  });

  getAllReservation = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationService.getAllReservations(req.query)
    );
  });

  getReservationById = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationService.getReservationById(req.params.reservationID)
    );
  });

  updateReservation = catchAsync(async (req, res) => {
    return OK(res, "Success", await reservationService.updateReservation(req));
  });

  deleteReservation = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationService.cancelReservation(
        req.params.reservationID,
        req.user
      )
    );
  });

  approveReservation = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationService.approveReservation(
        req.params.reservationID,
        req.user
      )
    );
  });

  denyReservation = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationService.denyReservation(
        req.params.reservationID,
        req.body.reason,
        req.user
      )
    );
  });
}

module.exports = new ReservationController();
