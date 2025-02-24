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

    await TOKEN.findOneAndUpdate(
      { userID: userId },
      {
        accessToken,
        refreshToken,
        expiryDate: new Date(Date.now() + ms(appConfig.JWT.accessTokenLife)),
        refreshTokenExpiryDate: new Date(
          Date.now() + ms(appConfig.JWT.refreshTokenLife)
        ),
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return { accessToken, refreshToken };
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

  async createTokenPair(payload, secretKey = config.JWT.secretKey) {
    try {
      // auth token
      const accessToken = await appConfig.JWT.sign(
        { ...payload, type: jwtTokens.ACCESS_TOKEN },
        secretKey,
        {
          expiresIn: appConfig.JWT.accessTokenLife,
        }
      );

      // refresh token
      const refreshToken = await appConfig.JWT.sign(
        {
          ...payload,
          type: jwtTokens.REFRESH_TOKEN,
        },
        secretKey,
        {
          expiresIn: appConfig.JWT.refreshTokenLife,
        }
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error(`createTokenPair error:: `, error);
    }
  }
}

module.exports = new TokenService();
