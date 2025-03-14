const jwt = require("jsonwebtoken");
const USER = require("../models/user.model");
const APIError = require("../utils/ApiError");
const appConfig = require("../configs/app.config"); // Thêm dòng này
const coupleTherapistRepo = require("../repositories/coupleTherapist.repo");
const certificateRepository = require("../repositories/certificate.repository");

const auth = async (req, res, next) => {
  try {
    // Try to get token from header first
    let token = req.header("Authorization")?.replace("Bearer ", "");

    // If no token in header, try from query params (for direct browser links)
    if (!token && req.query.token) {
      token = req.query.token;
      console.log(
        "Using token from query parameter:",
        token.substring(0, 10) + "..."
      );
    }

    // If no token in header or query, check if it's a Google callback with state
    if (!token && req.query.state) {
      try {
        // Try to extract userId from state and lookup token
        const stateData = JSON.parse(req.query.state);
        if (stateData.userId) {
          console.log(
            "Found userId in state, attempting to load user for Google callback"
          );
          const user = await USER.findOne({ _id: stateData.userId });
          if (user) {
            // Assign user directly for Google callback
            req.user = user;
            console.log(
              "Successfully loaded user from state for Google callback"
            );
            return next();
          }
        }
      } catch (stateError) {
        console.error("Error parsing state or finding user:", stateError);
      }
    }

    console.log("Authorization token:", token ? "present" : "missing");

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

const authenticateCallbackUser = async (req, res, next) => {
  try {
    // Check if this is a calendar authorization callback
    if (
      req.path.includes("/google/callback") &&
      req.query.scope &&
      req.query.scope.includes("calendar")
    ) {
      // For calendar callbacks, we need the user to be in the session already
      if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
      } else {
        // No authenticated user, redirect to login
        return res.redirect(
          `${appConfig.CLIENT_URL}/login?error=auth_required_for_calendar`
        );
      }
    }

    // For regular auth callbacks, continue
    next();
  } catch (error) {
    console.error("Callback authentication error:", error);
    next(error);
  }
};

module.exports = {
  auth,
  checkCertificate,
  authenticateCallbackUser,
};
