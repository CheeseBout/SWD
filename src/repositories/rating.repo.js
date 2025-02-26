const { content } = require("googleapis/build/src/apis/content");
const RATING = require("../models/rating.model");

class RatingRepository {
  async create(rating) {
    return await RATING.create(rating);
  }
  async getAll() {
    return await RATING.find();
  }
  async getById(ratingID) {
    return await RATING.findById(ratingID);
  }
  async update(ratingID, rating) {
    return await RATING.findByIdAndUpdate(ratingID, rating, { new: true });
  }
  async delete(ratingID) {
    return await RATING.findByIdAndUpdate(
      ratingID,
      { status: "deleted" },
      { new: true }
    );
  }
  async checkDuplicate(rating) {
    return await RATING.findOne({
      userID: rating.userID,
      therapistID: rating.therapistID,
      rate: rating.rate,
      content: rating.content,
    });
  }
}
module.exports = new RatingRepository();
