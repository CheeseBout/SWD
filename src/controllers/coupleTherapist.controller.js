const coupleTherapistServices = require("../services/coupleTherapist.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class CoupleTherapistController {
  getAllCoupleTherapist = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await coupleTherapistServices.getAllCoupleTherapist(req)
    );
  });

  getCoupleTherapistById = catchAsync(async (req, res) => {
    const { coupleTherapistId } = req.params;
    return OK(
      res,
      "Success",
      await coupleTherapistServices.getCoupleTherapistById(coupleTherapistId)
    );
  });

  createAvailability = catchAsync(async (req, res) => {
    const { coupleTherapistId, timeAvailable, notTimeAvailable } = req.body;

    const result = await coupleTherapistServices.createAvailability(
      coupleTherapistId,
      timeAvailable,
      notTimeAvailable
    );

    return OK(res, "Availability created successfully", result);
  });

  getAvailabilityById = catchAsync(async (req, res) => {
    const { id } = req.params;

    // Validate the therapist ID
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid therapist ID format",
      });
    }

    const availability = await coupleTherapistServices.getAvailabilityById(id);
    return OK(
      res,
      "Therapist availability retrieved successfully",
      availability
    );
  });

  updateAvailability = catchAsync(async (req, res) => {
    const { userID, timeAvailable, notTimeAvailable } = req.body;
    const { availabilityID } = req.params;

    const result = await coupleTherapistServices.updateAvailability(
      availabilityID,
      userID,
      timeAvailable,
      notTimeAvailable
    );

    return OK(res, "Success", result);
  });

  deleteAvailability = catchAsync(async (req, res) => {
    const { availabilityID } = req.params;
    return OK(
      res,
      "Success",
      coupleTherapistServices.deleteAvailability(availabilityID)
    );
  });
}

module.exports = new CoupleTherapistController();
