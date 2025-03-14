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

    // Remove permission check from here and pass the user object to the service
    return OK(
      res,
      "Success",
      await reservationService.getReservationsByUser(userID, {
        status,
        page,
        limit,
        user: req.user, // Pass the user object to the service
      })
    );
  });

  getReservationsByTherapist = catchAsync(async (req, res) => {
    const { coupleTherapistID } = req.params;
    const { status, page, limit } = req.query;

    return OK(
      res,
      "Therapist reservations retrieved successfully",
      await reservationService.getReservationsByTherapist(coupleTherapistID, {
        status,
        page,
        limit,
        user: req.user, // Pass the user object to the service
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
    // Remove price from the body
    return OK(
      res,
      "Reservation approved successfully",
      await reservationService.approveReservation(reservationID, req.user)
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
