const jwt = require("jsonwebtoken");
const USER = require("../models/user.model");
const APIError = require("../utils/ApiError");
const appConfig = require("../configs/app.config"); // Thêm dòng này

const auth = async (req, res, next) => {
  try {
    console.log("Authorization header:", req.header("Authorization"));

    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Extracted token:", token);

    if (!token) {
      throw new APIError(401, "No token provided");
    }

    try {
      // Thay process.env.JWT_SECRET bằng appConfig.JWT.secretKey
      const decoded = jwt.verify(token, appConfig.JWT.secretKey);
      console.log("Decoded token:", decoded);

      const user = await USER.findOne({ _id: decoded.userId });
      console.log("Found user:", user?._id);

      if (!user) {
        throw new APIError(401, "User not found");
      }

      req.user = user;
      next();
    } catch (jwtError) {
      console.log("JWT verification error:", jwtError);
      throw new APIError(401, "Invalid token");
    }
  } catch (error) {
    console.log("Auth middleware error:", error);
    next(new APIError(401, error.message || "Please authenticate"));
  }
};

module.exports = auth;
