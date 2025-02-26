const ratingRepo = require("../repositories/rating.repo");
const APIError = require("../utils/ApiError");

class RatingService {
  createRating = async (rating) => {
    const duplicate = await ratingRepo.checkDuplicate(rating);
    if (duplicate) throw new APIError(400, "Duplicate rating");
    return await ratingRepo.create(rating);
  };

  getAllRating = async () => {
    return await ratingRepo.getAll();
  };

  getRatingById = async (ratingID) => {
    return await ratingRepo.getById(ratingID);
  };

  updateRating = async (ratingID, rating) => {
    const duplicate = await ratingRepo.checkDuplicate(rating);
    if (duplicate) throw new APIError(400, "Duplicate rating");
    return await ratingRepo.update(ratingID, rating);
  };

  deleteRating = async (ratingID) => {
    return await ratingRepo.delete(ratingID);
  };
}

module.exports = new RatingService();
