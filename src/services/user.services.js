const userRepo = require("../repositories/user.repo");
const APIError = require("../utils/ApiError");

class UserService {
  async getAllUsers() {
    const users = await userRepo.find();
    return { users };
  }

  async getUserById(userId) {
    const user = await userRepo.getByID(userId);
    if (!user) {
      throw new APIError(400, "User not found");
    }
    return { user };
  }

  async updateProfile(req) {
    const userID = req.user._id;
    const user = await userRepo.getByID(userID);
    if (!user) {
      throw new APIError(400, "User not found");
    }

    const requestBody = { ...req.body };
    delete requestBody.email;
    delete requestBody.username;
    delete requestBody.password;
    delete requestBody.isGoogleUser;
    delete requestBody.role;
    delete requestBody.isVerified;
    delete requestBody.isActive;

    const updatedUser = await userRepo.update(userID, requestBody);
    return updatedUser;
  }
}

module.exports = new UserService();
