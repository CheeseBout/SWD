const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const APIError = require("../utils/ApiError");
const authRepo = require("../repositories/auth.repo");
const tokenRepo = require("../repositories/token.repo");
const tokenServices = require("./token.services");
const emailServices = require("./email.services");
const USER = require("../models/user.model");
const TOKEN = require("../models/token.model");
const ms = require("ms");
const appConfig = require("../configs/app.config");
const userRepo = require("../repositories/user.repo");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  async register({
    fullname,
    username,
    email,
    password,
    dob,
    gender,
    role = "user",
  }) {
    const existingUser = await authRepo.findUserByEmailAndUsername(
      email,
      username
    );
    if (existingUser) {
      throw new APIError(400, "Email/User already in use");
    }

    const user = await authRepo.createUser({
      fullname,
      username,
      email,
      password,
      dob,
      gender,
      role,
    });

    // Use token repository instead
    await tokenRepo.createInitialToken(user._id);

    return { user };
  }

  async updateExpertProfile(
    userId,
    { title, issuedDate, expiryDate, documentURL, description, category }
  ) {
    const user = await authRepo.findUserById(userId);
    if (!user || user.role !== "couple_therapist") {
      throw new APIError(400, "Invalid user or not a couple therapist");
    }

    const expert = await authRepo.findTherapistProfile(userId);
    if (!expert) {
      throw new APIError(400, "Expert profile not found");
    }

    const certificate = await authRepo.createCertificate({
      title,
      issuedDate,
      expiryDate,
      documentURL,
      category,
      isCertificateVerified: false,
    });

    const therapistCertificate = {
      certificateID: certificate._id,
      title,
      issuedDate,
      expiryDate,
      documentURL,
      category,
      updatedAt: new Date(),
      isCertificateVerified: false,
    };

    return await authRepo.updateTherapistProfile(userId, {
      $push: { certificates: therapistCertificate },
      description,
    });
  }

  async createTherapistProfile(userID) {
    return await authRepo.createTherapistProfile({
      userID,
      description: "New Couple Therapist",
      isVerified: false,
      certifications: [],
      rating: 0,
      reviewCount: 0,
      category: "General",
    });
  }

  async login({ email, password }) {
    const user = await authRepo.findUserByEmail(email);
    if (!user) {
      throw new APIError(400, "User not found");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new APIError(400, "Email or password is incorrect");
    }

    // Cập nhật login token
    await tokenRepo.updateLoginToken(user._id);

    // Tạo auth tokens
    const tokens = await tokenServices.generateAuthToken(user._id.toString());

    // Kiểm tra Google authorization
    const googleCreds = await tokenRepo.findTokenWithGoogleCreds(user._id);
    const needsGoogleAuth =
      !googleCreds?.access_token ||
      googleCreds.access_token === "NEED_GOOGLE_AUTH";

    return {
      tokens,
      googleAuth: {
        required: needsGoogleAuth,
        authUrl: "/api/v1/auth/login/google",
      },
    };
  }

  async forgotPassword({ email }) {
    const user = await authRepo.findUserByEmail(email);
    if (!user) {
      throw new APIError(404, "User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await tokenRepo.createPasswordResetToken({
      userID: user._id,
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
      expiryDate: new Date(Date.now() + 10 * 60 * 1000),
    });

    await emailServices.sendResetPassword({ email, hashedToken });
    return { resetToken: hashedToken };
  }

  async resetPassword({ resetToken, email, password }) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const tokenDoc = await tokenRepo.findAndUpdatePasswordResetToken({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!tokenDoc || tokenDoc.userID.email !== email) {
      throw new APIError(400, "Invalid or expired reset token");
    }

    const user = tokenDoc.userID;
    user.password = password;
    await user.save();

    await tokenRepo.deleteToken(tokenDoc._id);

    return user;
  }

  async sendVerifyEmail({ email }) {
    const user = await userRepo.getByEmail({
      email,
    });

    if (!user) {
      throw new APIError(400, "User not found");
    }

    if (user.isVerified === true) {
      throw new APIError(400, "User has already verified");
    }

    const emailVerificationToken = crypto.createHash("sha256").digest("hex");

    user.emailVerificationToken = emailVerificationToken;
    await user.save();

    await emailServices.sendVerificationEmail({
      email,
      emailVerificationToken,
    });
  }

  async verifyEmail({ email, token }) {
    const user = await userRepo.getByEmail({
      email,
    });

    if (!user) {
      throw new APIError(400, "User not found");
    }

    if (user.isVerified) {
      throw new APIError(400, "Email is already verified");
    }

    if (user.emailVerificationToken !== token || !user.emailVerificationToken) {
      throw new APIError(400, "Invalid verification token");
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return user;
  }

  async loginWithGoogle(idToken) {
    try {
      if (!idToken) {
        throw new APIError(400, "Missing Google ID Token");
      }

      // Xác thực Google ID Token
      const ticket = await client.verifyIdToken({
        idToken,
        audience: [
          appConfig.GOOGLE.FIREBASE_WEB_ID,
          appConfig.GOOGLE.ANDROID_ID,
          appConfig.GOOGLE.IOS_ID,
        ].filter(Boolean),
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new APIError(400, "Invalid Google ID Token");
      }

      // Log payload info for debugging
      console.log("Google Auth Payload:", {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        aud: payload.aud, // The audience the token was issued to
        iss: payload.iss, // The issuer
      });

      const googleEmail = payload.email;
      let user = await authRepo.findUserByEmail(googleEmail);

      // Nếu user chưa tồn tại, tạo user mới
      if (!user) {
        user = await authRepo.createUser({
          fullname: payload.name || googleEmail,
          username: googleEmail.split("@")[0],
          email: googleEmail,
          password: null,
          dob: new Date(),
          gender: "other",
          photoURL: payload.picture,
          role: "user",
          isVerified: true,
          address: "None",
        });
      }

      // Tạo JWT Token để frontend sử dụng
      const authTokens = await tokenServices.generateAuthToken(
        user._id.toString()
      );

      return {
        user: {
          _id: user._id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          dob: user.dob,
          gender: user.gender,
          photoURL: user.photoURL,
          role: "user",
          isVerified: true,
          address: "None",
        },
        ...authTokens,
      };
    } catch (error) {
      console.error("Google login service error details:", error);

      // More specific error handling
      if (error.message && error.message.includes("audience")) {
        throw new APIError(
          400,
          "Invalid client ID. Token was issued for a different application."
        );
      }

      throw new APIError(400, "Google login failed: " + error.message);
    }
  }

  async changePassword({ userId, oldPassword, newPassword }) {
    const user = await authRepo.findUserById(userId);
    if (!user) {
      throw new APIError(400, "User not found");
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      throw new APIError(400, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return user;
  }
}

module.exports = new AuthService();
