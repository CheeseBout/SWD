const reservationResultService = require("../services/reservationResult.service");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class ReservationResultController {
  createReservationResult = catchAsync(async (req, res) => {
    // Debug auth issue
    console.log("Auth headers:", req.headers.authorization);
    console.log("User in request:", req.user);

    return OK(
      res,
      "Reservation result created successfully",
      await reservationResultService.createReservationResult(req)
    );
  });

  getReservationResult = catchAsync(async (req, res) => {
    return OK(
      res,
      "Reservation result retrieved successfully",
      await reservationResultService.getReservationResult(
        req.params.reservationResultID
      )
    );
  });

  updateReservationResult = catchAsync(async (req, res) => {
    return OK(
      res,
      "Reservation result updated successfully",
      await reservationResultService.updateReservationResult(
        req.params.reservationResultID,
        req.body,
        req.user
      )
    );
  });

  deleteReservationResult = catchAsync(async (req, res) => {
    return OK(
      res,
      "Reservation result deleted successfully",
      await reservationResultService.deleteReservationResult(
        req.params.reservationResultID,
        req.body.deleteReason,
        req.user
      )
    );
  });

  getAllReservationResultByUser = catchAsync(async (req, res) => {
    const { userID } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    return OK(
      res,
      "Reservation results retrieved successfully",
      await reservationResultService.getAllReservationResultsByUser(userID, {
        status,
        page: parseInt(page),
        limit: parseInt(limit),
        user: req.user,
      })
    );
  });

  getAllReservationResultByTherapist = catchAsync(async (req, res) => {
    const { coupleTherapistID } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    return OK(
      res,
      "Reservation results retrieved successfully",
      await reservationResultService.getAllReservationResultsByTherapist(
        coupleTherapistID,
        {
          status,
          page: parseInt(page),
          limit: parseInt(limit),
          user: req.user,
        }
      )
    );
  });
}

module.exports = new ReservationResultController();
