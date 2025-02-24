const TOKEN = require("../models/token.model");
const ms = require("ms");
const appConfig = require("../configs/app.config");

class TokenRepository {
  async createInitialToken(userId) {
    return await TOKEN.create({
      userID: userId,
      googleToken: null,
      googleRefreshToken: null,
      googleTokenExpiry: null,
      expiryDate: new Date(Date.now() + ms(appConfig.JWT.accessTokenLife)),
    });
  }

  async updateLoginToken(userId) {
    return await TOKEN.findOneAndUpdate(
      { userID: userId },
      {
        updatedAt: new Date(),
        expiryDate: new Date(Date.now() + ms(appConfig.JWT.accessTokenLife)),
      },
      { upsert: true }
    );
  }

  async findAndUpdatePasswordResetToken(filter, update) {
    return await TOKEN.findOne(filter).populate("userID");
  }

  async deleteToken(tokenId) {
    return await TOKEN.deleteOne({ _id: tokenId });
  }

  async updateGoogleToken(userId, accessToken) {
    return await TOKEN.findOneAndUpdate(
      { userID: userId },
      {
        googleToken: accessToken,
        expiryDate: new Date(Date.now() + ms(appConfig.JWT.accessTokenLife)),
        updatedAt: new Date(),
      },
      { upsert: true }
    );
  }

  async saveGoogleToken(userId, tokens) {
    let tokenDoc = await TOKEN.findOne({ userID: userId });
    if (tokenDoc) {
      tokenDoc.googleToken = JSON.stringify(tokens);
      return await tokenDoc.save();
    }
    return await TOKEN.create({
      userID: userId,
      googleToken: JSON.stringify(tokens),
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }

  async getGoogleToken(userId) {
    const tokenDoc = await TOKEN.findOne({ userID: userId });
    if (!tokenDoc?.googleToken) return null;
    return JSON.parse(tokenDoc.googleToken);
  }

  async findTokenByUserId(userId) {
    return await TOKEN.findOne({ userID: userId });
  }

  async createPasswordResetToken(userId, hashedToken) {
    return await TOKEN.findOneAndUpdate(
      { userID: userId },
      {
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
        expiryDate: new Date(Date.now() + 10 * 60 * 1000),
      },
      { upsert: true }
    );
  }

  async findTokenByResetToken(hashedToken) {
    return await TOKEN.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).populate("userID");
  }

  async findTokenWithGoogleCreds(userId) {
    const tokenDoc = await TOKEN.findOne({ userID: userId });
    return tokenDoc?.googleToken
      ? {
          access_token: tokenDoc.googleToken,
        }
      : null;
  }
}

module.exports = new TokenRepository();
