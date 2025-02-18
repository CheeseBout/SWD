const coupleTherapistServices = require("../services/coupleTherapist.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class CoupleTherapistController {
  getAllCoupleTherapist = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await coupleTherapistServices.getAllCoupleTherapist()
    );
  });

  getCoupleTherapistById = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await coupleTherapistServices.getCoupleTherapistById(req.params.id)
    );
  });

  createAvailability = catchAsync(async (req, res) => {
    const { id, timeAvailable, notTimeAvailable } = req.body;

    const result = await coupleTherapistServices.createAvailability(
      id,
      timeAvailable,
      notTimeAvailable
    );

    return OK(res, "Success", result);
  });

  getAvailability = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      coupleTherapistServices.getAvailability(req.params.id)
    );
  });

  updateAvailability = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      coupleTherapistServices.getAvailability(req.params.id)
    );
  });

  deleteAvailability = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      coupleTherapistServices.getAvailability(req.params.id)
    );
  });
}

module.exports = new CoupleTherapistController();
