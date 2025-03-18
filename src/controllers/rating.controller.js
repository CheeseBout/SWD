const ratingService = require("../services/rating.service");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");
const APIError = require("../utils/ApiError");

class RatingController {
  createRating = catchAsync(async (req, res) => {
    const { userID, coupleTherapistID, rate, content } = req.body;
    const result = await ratingService.createRating(req, {
      userID,
      coupleTherapistID,
      rate,
      content,
    });
    return OK(res, "Success", result);
  });

  getAllRating = catchAsync(async (req, res) => {
    return OK(res, "Success", await ratingService.getAllRating());
  });

  getRatingById = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await ratingService.getRatingById(req.params.ratingID)
    );
  });

  checkRatingForReservation = catchAsync(async (req, res) => {
    if (!req.user) {
      throw new APIError(401, "Authentication required");
    }

    if (req.user.role !== "member") {
      throw new APIError(403, "Permission denied: Insufficient privileges");
    }

    const coupleTherapistID = req.params.coupleTherapistID;
    console.log("Checking ratings for therapist:", coupleTherapistID);

    if (!coupleTherapistID) {
      throw new APIError(400, "Missing therapist ID parameter");
    }

    const result = await ratingService.checkRatingForReservation(
      req,
      coupleTherapistID
    );

    return OK(res, "Rating check completed", result);
  });

  getRatingByTherapistId = catchAsync(async (req, res) => {
    const therapistId = req.params.therapistId;

    if (!therapistId) {
      throw new APIError(400, "Missing therapist ID parameter");
    }

    const ratings = await ratingService.getRatingByTherapistId(therapistId);
    return OK(res, "Therapist ratings retrieved successfully", ratings);
  });

  updateRating = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await ratingService.updateRating(req, req.params.ratingID, req.body)
    );
  });

  deleteRating = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await ratingService.deleteRating(req, req.params.ratingID)
    );
  });
}
module.exports = new RatingController();
