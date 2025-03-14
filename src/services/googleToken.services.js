const TOKEN = require("../models/token.model");
const USER = require("../models/user.model");
const tokenRepo = require("../repositories/token.repo");

class GoogleTokenService {
  async saveGoogleToken(userId, tokens) {
    try {
      console.log("Saving Google token for user:", userId);
      console.log("Token type:", typeof tokens);

      // Cập nhật trường isGoogleUser trong model User
      await USER.findByIdAndUpdate(userId, {
        isGoogleUser: true,
        updatedAt: new Date(),
      });
      console.log("User marked as Google connected");

      let tokenDoc = await tokenRepo.findTokenByUserId(userId);

      if (tokenDoc) {
        console.log("Updating existing token document");
        tokenDoc.googleToken = JSON.stringify(tokens);
        tokenDoc.tokenUpdatedAt = new Date();
        return await tokenDoc.save();
      }

      console.log("Creating new token document");
      return await TOKEN.create({
        userID: userId,
        googleToken: JSON.stringify(tokens),
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day expiry
        tokenUpdatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error saving Google token:", error);
      throw error;
    }
  }

  async getGoogleToken(userId) {
    try {
      const tokenDoc = await tokenRepo.findTokenByUserId(userId);
      if (!tokenDoc?.googleToken) {
        console.log("No Google token found for user:", userId);
        return null;
      }

      console.log("Google token found for user:", userId);
      return JSON.parse(tokenDoc.googleToken);
    } catch (error) {
      console.error("Error getting Google token:", error);
      return null;
    }
  }

  async checkGoogleConnection(userId) {
    try {
      // Kiểm tra token và trạng thái isGoogleUser
      const [tokenDoc, user] = await Promise.all([
        tokenRepo.findTokenByUserId(userId),
        USER.findById(userId),
      ]);

      const hasGoogleToken = tokenDoc?.googleToken ? true : false;
      const isGoogleUser = user?.isGoogleUser || false;

      return {
        isConnected: hasGoogleToken && isGoogleUser,
        hasToken: hasGoogleToken,
        isGoogleUser: isGoogleUser,
      };
    } catch (error) {
      console.error("Error checking Google connection:", error);
      return { isConnected: false, error: error.message };
    }
  }
}

module.exports = new GoogleTokenService();
