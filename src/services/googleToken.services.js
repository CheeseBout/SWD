const TOKEN = require("../models/token.model");

class GoogleTokenService {
  async saveGoogleToken(userId, tokens) {
    let tokenDoc = await TOKEN.findOne({ userID: userId });

    if (tokenDoc) {
      tokenDoc.googleToken = JSON.stringify(tokens);
      return await tokenDoc.save();
    }

    return await TOKEN.create({
      userID: userId,
      googleToken: JSON.stringify(tokens),
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day expiry
    });
  }

  async getGoogleToken(userId) {
    const tokenDoc = await TOKEN.findOne({ userID: userId });
    if (!tokenDoc?.googleToken) return null;
    return JSON.parse(tokenDoc.googleToken);
  }
}

module.exports = new GoogleTokenService();
