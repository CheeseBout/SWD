const reservationService = require("../services/reservation.service");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class ReservationController {
  createReservation = catchAsync(async (req, res) => {
    const result = await reservationService.createReservation(req);
    return OK(res, "Success", result);
  });

  getAllReservation = catchAsync(async (req, res) => {
    const { page, limit, ...filter } = req.query;
    return OK(
      res,
      "Success",
      await reservationService.getAllReservations(filter, { page, limit })
    );
  });

  getReservationById = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationService.getReservationById(req.params.reservationID)
    );
  });

  getReservationsByUser = catchAsync(async (req, res) => {
    const { userID } = req.params;
    const { status, page, limit } = req.query;

    // Check if the requesting user has permission to view these reservations
    if (
      req.user.role !== "admin" &&
      req.user.role !== "couple_therapist" &&
      req.user._id.toString() !== userID
    ) {
      throw new APIError(403, "Permission denied");
    }

    return OK(
      res,
      "Success",
      await reservationService.getReservationsByUser(userID, {
        status,
        page,
        limit,
      })
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
    const { reservationID } = req.params;
    const { price } = req.body;
    return OK(
      res,
      "Success",
      await reservationService.approveReservation(
        reservationID,
        price,
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
