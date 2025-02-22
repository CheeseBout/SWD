const jwt = require("jsonwebtoken");
const TOKEN = require("../models/token.model");
const appConfig = require("../configs/app.config");
const ms = require("ms");

class TokenService {
  async generateAuthToken(userId) {
    const accessToken = jwt.sign({ userId }, appConfig.JWT.secretKey, {
      expiresIn: appConfig.JWT.accessTokenLife,
    });

    const refreshToken = jwt.sign({ userId }, appConfig.JWT.secretKey, {
      expiresIn: appConfig.JWT.refreshTokenLife,
    });

    const accessTokenExpiry = new Date(
      Date.now() + ms(appConfig.JWT.accessTokenLife)
    );
    const refreshTokenExpiry = new Date(
      Date.now() + ms(appConfig.JWT.refreshTokenLife)
    );

    await TOKEN.create({
      userID: userId,
      accessToken,
      refreshToken,
      expiryDate: accessTokenExpiry,
      refreshTokenExpiryDate: refreshTokenExpiry,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyToken(token) {
    return jwt.verify(token, appConfig.JWT.secretKey);
  }

  async removeToken(accessToken) {
    return TOKEN.deleteOne({ accessToken });
  }

  async findToken(accessToken) {
    return TOKEN.findOne({ accessToken });
  }
}

module.exports = new TokenService();
