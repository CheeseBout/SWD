const jwt = require("jsonwebtoken");
const USER = require("../models/user.model");
const APIError = require("../utils/ApiError");
const appConfig = require("../configs/app.config"); // Thêm dòng này
const coupleTherapistRepo = require("../repositories/coupleTherapist.repo");
const certificateRepository = require("../repositories/certificate.repository");

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

const checkCertificate = async (req, res, next) => {
  try {
    // Kiểm tra user (phải có từ middleware auth trước đó)
    if (!req.user) {
      throw new APIError(401, "Please authenticate");
    }

    // Kiểm tra role có phải là couple_therapist
    if (req.user.role !== "couple_therapist") {
      throw new APIError(
        403,
        "Access denied. Only therapists can access this resource"
      );
    }

    // Kiểm tra certificate từ coupleTherapist collection
    const therapist = await coupleTherapistRepo.findOne({
      userID: req.user._id,
    });

    if (!therapist) {
      throw new APIError(403, "No therapist profile found");
    }

    // Kiểm tra xem có certificate nào được verify không
    const hasVerifiedCertificate = therapist.certificates.some(
      (cert) => cert.status === "approved"
    );

    if (!hasVerifiedCertificate) {
      throw new APIError(
        403,
        "You must have at least one verified certificate"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { auth, checkCertificate };
