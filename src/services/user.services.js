const USER = require("../models/user.model");
const APIError = require("../utils/ApiError");
class UserService {
  async getAllUsers() {
    const data = await USER.find();
    return { users: data };
  }

  async getUserById(userId) {
    const data = await USER.findById(userId);
    if (!userId) {
      throw new APIError(400, "User not found");
    }
    return { user: data };
  }

  async updateProfile(req) {
    const userID = req.user._id;
    const user = await USER.findById(userID);
    if (!user) {
      throw new APIError(400, "User not found");
    }

    const requestBody = { ...req.body };
    // Xóa email và password khỏi req body để không cho phép cập nhật password trong hàm này vì password được phép cập nhật ở hàm khác
    delete requestBody.email;
    delete requestBody.password;
    delete requestBody.role;
    delete requestBody.isVerified;
    delete requestBody.isActive;

    const updatedUser = await USER.findByIdAndUpdate(userID, requestBody, {
      new: true,
    });
    return updatedUser;
  }
}

module.exports = new UserService();
