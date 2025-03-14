const TOKEN = require("../models/token.model");
const ms = require("ms");
const appConfig = require("../configs/app.config");
const crypto = require("crypto");

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

  async updateGoogleToken(userId, accessToken, email) {
    return await TOKEN.findOneAndUpdate(
      { userID: userId },
      {
        googleToken: accessToken,
        userEmail: email, // Thêm trường email để track
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

  async createPasswordResetToken(tokenData) {
    return await TOKEN.create(tokenData);
  }

  async findTokenByResetToken(hashedToken) {
    return await TOKEN.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).populate("userID");
  }

  async findTokenWithGoogleCreds(userId) {
    const tokenDoc = await TOKEN.findOne({ userID: userId });

    if (!tokenDoc || !tokenDoc.googleToken) {
      return null;
    }

    try {
      // Try to parse the token
      let parsedToken;
      try {
        parsedToken = JSON.parse(tokenDoc.googleToken);
      } catch (e) {
        // If not parsed correctly, return the raw token
        return {
          access_token: tokenDoc.googleToken,
          userEmail: tokenDoc.userEmail,
        };
      }

      // Return the properly formatted token
      return parsedToken;
    } catch (error) {
      console.error("Error parsing Google token:", error);
      return null;
    }
  }

  async generateInitialGoogleToken(userId) {
    const initialToken = crypto.randomBytes(32).toString("hex");
    return await TOKEN.findOneAndUpdate(
      { userID: userId },
      {
        googleToken: initialToken,
        googleTokenExpiry: new Date(
          Date.now() + ms(appConfig.JWT.accessTokenLife)
        ),
        updatedAt: new Date(),
      },
      { upsert: true }
    );
  }

  // Thêm phương thức debug để in thông tin token
  async debugToken(userId) {
    try {
      const token = await this.findTokenByUserId(userId);

      if (!token) {
        console.log(`No token found for user ${userId}`);
        return { found: false };
      }

      const hasGoogleToken = !!token.googleToken;
      let googleTokenInfo = null;

      if (hasGoogleToken) {
        try {
          const parsedToken = JSON.parse(token.googleToken);
          googleTokenInfo = {
            hasAccessToken: !!parsedToken.access_token,
            hasRefreshToken: !!parsedToken.refresh_token,
            accessTokenPrefix:
              parsedToken.access_token?.substring(0, 10) + "...",
            refreshTokenPrefix:
              parsedToken.refresh_token?.substring(0, 10) + "...",
            expiryTime: parsedToken.expiry_date,
            expiryDate: parsedToken.expiry_date
              ? new Date(parsedToken.expiry_date)
              : null,
          };
        } catch (e) {
          googleTokenInfo = { error: e.message, raw: token.googleToken };
        }
      }

      return {
        found: true,
        id: token._id,
        userId: token.userID,
        hasGoogleToken,
        googleTokenInfo,
        expiryDate: token.expiryDate,
        updatedAt: token.tokenUpdatedAt || token.updatedAt,
      };
    } catch (error) {
      console.error("Debug token error:", error);
      return { error: error.message };
    }
  }
}

module.exports = new TokenRepository();
