const appConfig = require("../configs/app.config");
const jwt = require("jsonwebtoken");
class TokenService {
  async createJWTToken({ data, lifetime }) {
    console.log(lifetime);
    return await jwt.sign(data, appConfig.JWT.secretKey, {
      expiresIn: lifetime,
    });
  }

  async generateAuthToken(userId) {
    const accessToken = await this.createJWTToken({
      data: { userId },
      lifetime: appConfig.JWT.accessTokenLife,
    });
    const refreshToken = await this.createJWTToken({
      data: { userId },
      lifetime: appConfig.JWT.refreshTokenLife,
    });
    return { accessToken, refreshToken };
  }

  verifyJwt = (token, keySecret) => {
    return JWT.verify(token, keySecret);
  };
}

module.exports = new TokenService();
