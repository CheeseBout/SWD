const jwt = require("jsonwebtoken");
const TOKEN = require("../models/token.model");
const appConfig = require("../configs/app.config");
class TokenService {
  async generateAuthToken(userId) {
    const accessToken = jwt.sign({ userId }, appConfig.JWT.secretKey, {
      expiresIn: appConfig.jwt.accessTokenLife,
    });

    const refreshToken = jwt.sign({ userId }, appConfig.jwt.secretKey, {
      expiresIn: appConfig.jwt.refreshTokenLife,
    });

    const expiryDate = new Date();
    expiryDate.setMinutes(
      expiryDate.getMinutes() + appConfig.jwt.accessTokenLife
    );

    await TOKEN.create({
      userID: userId,
      accessToken,
      refreshToken,
      expiryDate,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyToken(token) {
    return jwt.verify(token, appConfig.jwt.secretKey);
  }

  async removeToken(accessToken) {
    return TOKEN.deleteOne({ accessToken });
  }

  async findToken(accessToken) {
    return TOKEN.findOne({ accessToken });
  }
}

module.exports = new TokenService();
