const ratingService = require("../services/rating.service");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class RatingController {
  createRating = catchAsync(async (req, res) => {
    const { userID, coupleTherapistID, rate, content } = req.body;
    const result = await ratingService.createRating({
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

  updateRating = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await ratingService.updateRating(req.params.ratingID, req.body)
    );
  });

  deleteRating = catchAsync(async (req, res) => {
    return OK(
      res,
      "Success",
      await ratingService.deleteRating(req.params.ratingID)
    );
  });
}
module.exports = new RatingController();
