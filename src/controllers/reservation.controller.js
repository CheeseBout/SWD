const reservationService = require("../services/reservation.service");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class ResevationController {
  createReservation = catchAsync(async (req, res) => {
    const {
      userID,
      coupleTherapistID,
      title,
      content,
      packageID,
      startTime,
      endTime,
      totalPrice,
      meetingURL,
    } = req.body;
    const result = await reservationService.createReservation({
      userID,
      coupleTherapistID,
      title,
      content,
      packageID,
      startTime,
      endTime,
      totalPrice,
      meetingURL,
    });
    return OK(res, "Success", result);
  });

  getReservationById = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await reservationService.getReservationById(req.params.id)
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
