const USER = require("../models/user.model");
const APIError = require("../utils/ApiError");
class UserService {
  async getAllUsers() {
    const data = await USER.find();
    return data;
  }

  async getUserById(userId) {
    const data = await USER.findById(userId);
    if (!userId) {
      throw new APIError(400, "User not found");
    }
    return data;
  }
}

module.exports = new UserService();
