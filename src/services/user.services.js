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
    try {
      const userID = req.user?._id;
      if (!userID) {
        throw new APIError(401, "Unauthorized: User ID missing");
      }

      const user = await userRepo.getByID(userID);
      if (!user) {
        throw new APIError(404, "User not found");
      }

      const allowedFields = [
        "fullname",
        "dob",
        "gender",
        "photoURL",
        "address",
      ];

      const requestBody = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
      );

      if (Object.keys(requestBody).length === 0) {
        throw new APIError(400, "No valid fields to update");
      }

      const updatedUser = await userRepo.update(userID, requestBody);
      return {
        message: "Updated information successfully",
        updatedUser,
      };
    } catch (error) {
      console.error(`Error updating profile: ${error.message}`);
      throw new APIError(500, `Update failed: ${error.message}`);
    }
  }
}

module.exports = new UserService();
