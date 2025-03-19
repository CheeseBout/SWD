const { content } = require("googleapis/build/src/apis/content");
const RATING = require("../models/rating.model");
const COUPLETHERAPIST = require("../models/coupleTherapist.model");
const mongoose = require("mongoose");
const APIError = require("../utils/ApiError");

class RatingRepository {
  async create(rating) {
    return await RATING.create(rating);
  }

  async updateRatingToTherapist(coupleTherapistID, rate) {
    // Cập nhật ratingCount và ratingSum, đồng thời tính averageRating luôn
    const therapist = await COUPLETHERAPIST.findById(coupleTherapistID);
    if (!therapist) {
      throw new Error("Therapist not found");
    }

    // Tăng số lượng rating và tổng điểm
    therapist.ratingCount += 1;
    therapist.ratingSum += rate;

    // Tính lại điểm trung bình
    therapist.averageRating = therapist.ratingSum / therapist.ratingCount;

    // Lưu thay đổi và trả về bản ghi đã cập nhật
    return await therapist.save();
  }

  async updateExistingRating(oldRating, newRating) {
    // Xử lý khi cập nhật rating hiện có
    const therapist = await COUPLETHERAPIST.findById(
      newRating.coupleTherapistID
    );
    if (!therapist) {
      throw new Error("Therapist not found");
    }

    // Trừ đi giá trị cũ, thêm giá trị mới
    therapist.ratingSum = therapist.ratingSum - oldRating.rate + newRating.rate;

    // Tính lại điểm trung bình
    therapist.averageRating = therapist.ratingSum / therapist.ratingCount;

    return await therapist.save();
  }

  async getAll() {
    return await RATING.find();
  }

  async getById(ratingID) {
    return await RATING.findById(ratingID);
  }

  async getRatingByTherapistId(therapistId) {
    return await RATING.find({ coupleTherapistID: therapistId })
      .populate("userID")
      .populate("coupleTherapistID");
  }

  async update(ratingID, rating) {
    const oldRating = await this.getById(ratingID);
    const updatedRating = await RATING.findByIdAndUpdate(ratingID, rating, {
      new: true,
    });

    // Cập nhật điểm đánh giá của therapist nếu điểm đánh giá thay đổi
    if (oldRating.rate !== rating.rate) {
      await this.updateExistingRating(oldRating, updatedRating);
    }

    return updatedRating;
  }

  async delete(ratingID) {
    const rating = await this.getById(ratingID);
    if (!rating) {
      throw new Error("Rating not found");
    }

    // Cập nhật lại điểm đánh giá của therapist khi xóa rating
    const therapist = await COUPLETHERAPIST.findById(rating.coupleTherapistID);
    if (therapist) {
      therapist.ratingCount -= 1;
      therapist.ratingSum -= rating.rate;

      if (therapist.ratingCount > 0) {
        therapist.averageRating = therapist.ratingSum / therapist.ratingCount;
      } else {
        therapist.averageRating = 0;
      }

      await therapist.save();
    }

    return await RATING.findByIdAndUpdate(
      ratingID,
      { status: "deleted" },
      { new: true }
    );
  }

  async checkRatingForReservation(reservationID) {
    console.log("Checking rating for reservation ID:", reservationID);

    try {
      // Use find with a query object instead of findById
      const ratings = await RATING.find({ reservationID });
      console.log("Ratings found:", ratings);
      return ratings;
    } catch (error) {
      console.error("Error in checkRatingForReservation:", error);
      return null;
    }
  }

  async checkDuplicate(rating) {
    return await RATING.findOne({
      userID: rating.userID,
      coupleTherapistID: rating.coupleTherapistID,
      rate: rating.rate,
      content: rating.content,
      reservationID: rating.reservationID,
    });
  }
}
module.exports = new RatingRepository();
