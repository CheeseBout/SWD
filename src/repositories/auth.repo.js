const USER = require("../models/user.model");
const TOKEN = require("../models/token.model");
const CERTIFICATE = require("../models/certificate.model");
const COUPLETHERAPIST = require("../models/coupleTherapist.model");

class AuthRepo {
  async findUserByEmail(email) {
    return await USER.findOne({ email });
  }

  async findUserByEmailAndUsername(email, username) {
    return await USER.findOne({ email, username });
  }

  async createUser(userData) {
    return await USER.create(userData);
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
    return await COUPLETHERAPIST.create(profileData);
  }

  async createPasswordResetToken(tokenData) {
    return await TOKEN.create(tokenData);
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
