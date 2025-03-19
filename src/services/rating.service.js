const ratingRepo = require("../repositories/rating.repo");
const APIError = require("../utils/ApiError");

class RatingService {
  createRating = async (req, rating) => {
    if (!req || !req.user) {
      throw new APIError(403, "Permission denied: User not authenticated");
    }

    console.log("req.user.role", req.user.role);

    if (req.user.role !== "member") {
      throw new APIError(403, "Permission denied: Insufficient privileges");
    }

    // Check if reservationID is provided
    if (!rating.reservationID) {
      throw new APIError(400, "Reservation ID is required");
    }

    const duplicate = await ratingRepo.checkDuplicate(rating);
    if (duplicate) throw new APIError(400, "Duplicate rating");

    // Tạo rating mới
    const newRating = await ratingRepo.create(rating);

    // Cập nhật rating cho therapist
    await ratingRepo.updateRatingToTherapist(
      newRating.coupleTherapistID,
      newRating.rate
    );

    return newRating;
  };

  checkRatingForReservation = async (req, reservationID) => {
    try {
      console.log("Looking for ratings with reservation ID:", reservationID);

      if (!reservationID) {
        throw new Error("Missing reservationID parameter");
      }

      // Kiểm tra và log ID người dùng hiện tại nếu có
      const userID = req && req.user ? req.user.id : null;
      console.log("Current user ID:", userID);

      const ratings = await ratingRepo.checkRatingForReservation(reservationID);
      console.log("Ratings found:", ratings);

      return ratings;
    } catch (error) {
      console.error("Error in service:", error);
      throw new APIError(
        400,
        "Error checking rating for reservation: " + error.message
      );
    }
  };

  getRatingByTherapistId = async (therapistId) => {
    return await ratingRepo.getRatingByTherapistId(therapistId);
  };
  getAllRating = async () => {
    return await ratingRepo.getAll();
  };

  getRatingById = async (ratingID) => {
    return await ratingRepo.getById(ratingID);
  };

  updateRating = async (req, ratingID, rating) => {
    if (!req || !req.user) {
      throw new APIError(403, "Permission denied: User not authenticated");
    }

    if (req.user.role !== "member") {
      throw new APIError(403, "Permission denied: Insufficient privileges");
    }

    const existing = await ratingRepo.getById(ratingID);
    if (!existing) throw new APIError(404, "Rating not found");

    // Check if the user owns this rating or has admin rights
    if (
      existing.userID.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      throw new APIError(403, "You can only edit your own ratings");
    }

    const duplicate = await ratingRepo.checkDuplicate(rating);
    if (duplicate && duplicate._id.toString() !== ratingID) {
      throw new APIError(400, "Duplicate rating");
    }

    return await ratingRepo.update(ratingID, rating);
  };

  deleteRating = async (req, ratingID) => {
    if (!req || !req.user) {
      throw new APIError(403, "Permission denied: User not authenticated");
    }

    if (req.user.role !== "member") {
      throw new APIError(403, "Permission denied: Insufficient privileges");
    }

    return await ratingRepo.delete(ratingID);
  };
}

module.exports = new RatingService();
