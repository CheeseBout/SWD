const USER = require("../models/user.model");
const TOKEN = require("../models/token.model");
const CERTIFICATE = require("../models/certificate.model");
const COUPLETHERAPIST = require("../models/coupleTherapist.model");
const APIError = require("../utils/ApiError");

class AuthRepo {
  async findUserByEmail(email) {
    return await USER.findOne({ email });
  }

  async findUserByEmailAndUsername(email, username) {
    return await USER.findOne({
      $or: [{ email }, { username }],
    });
  }

  async createUser(userData) {
    try {
      const user = new USER(userData);
      return await user.save();
    } catch (error) {
      console.error("Create user error:", error);
      throw new APIError(400, error.message);
    }
  }

  async findUserById(userId) {
    return await USER.findById(userId);
  }

  async findTherapistProfile(userId) {
    return await COUPLETHERAPIST.findOne({ userID: userId });
  }

  async createCertificate(certificateData) {
    return await CERTIFICATE.create(certificateData);
  }

  async updateTherapistProfile(userId, updateData) {
    return await COUPLETHERAPIST.findOneAndUpdate(
      { userID: userId },
      updateData,
      { new: true, runValidators: true }
    );
  }

  async createTherapistProfile(profileData) {
    try {
      // First check if profile already exists
      const existingProfile = await COUPLETHERAPIST.findOne({
        userID: profileData.userID,
      });

      if (existingProfile) {
        return existingProfile;
      }

      // Create new profile if it doesn't exist
      const therapistProfile = await COUPLETHERAPIST.create(profileData);

      // Also update the user's role if needed
      await USER.findByIdAndUpdate(profileData.userID, {
        role: "couple_therapist",
      });

      return therapistProfile;
    } catch (error) {
      console.error("Create therapist profile error:", error);
      throw new APIError(
        400,
        "Failed to create therapist profile: " + error.message
      );
    }
  }

  async findPasswordResetToken(hashedToken) {
    return await TOKEN.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).populate("userID");
  }

  async deleteToken(tokenId) {
    return await TOKEN.deleteOne({ _id: tokenId });
  }
}

module.exports = new AuthRepo();
