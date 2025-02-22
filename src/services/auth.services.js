const USER = require("../models/user.model");
const TOKEN = require("../models/token.model");
const APIError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");
const tokenServices = require("./token.services");
const emailServices = require("./email.services");
const crypto = require("crypto");
const CERTIFICATE = require("../models/certificate.model");
const COUPLETHERAPIST = require("../models/coupleTherapist.model");

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
    const existingUser = await USER.findOne({ email, username });
    if (existingUser) {
      throw new APIError(400, "Email/User already in use");
    }

    // Create base user
    const user = await USER.create({
      fullname,
      username,
      email,
      password,
      dob,
      gender,
      role,
    });

    return {
      user,
      // role,
    };
  }

  async updateExpertProfile(
    userId,
    { title, issuedDate, expiryDate, documentURL, description, category }
  ) {
    const user = await USER.findById(userId);

    if (!user) {
      throw new APIError(404, "User not found");
    }

    if (user.role !== "couple_therapist") {
      throw new APIError(400, "User is not a couple therapist");
    }

    // Check if expert profile exists
    let expert = await COUPLETHERAPIST.findOne({ userID: userId });
    if (!expert) {
      throw new APIError(400, "Expert profile not found");
    }

    // First create the certificate in Certificates collection
    const certificate = await CERTIFICATE.create({
      title,
      issuedDate,
      expiryDate,
      documentURL,
      category,
      isCertificateVerified: false,
    });

    // Create certificate object for CoupleTherapist with reference
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

    // Update expert profile
    expert = await COUPLETHERAPIST.findOneAndUpdate(
      { userID: userId },
      {
        $push: { certificates: therapistCertificate },
        description: description,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return expert;
  }

  async createTherapistProfile(userID) {
    const newTherapistProfile = await COUPLETHERAPIST.create({
      userID: userID,
      description: "New Couple Therapist",
      isVerified: false,
      certifications: [],
      rating: 0,
      reviewCount: 0,
      category: "General",
    });
    return newTherapistProfile;
  }

  async login({ email, password }) {
    const user = await USER.findOne({
      email,
    });

    if (!user) {
      throw new APIError(400, "User not found");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new APIError(400, "Email or password is incorrect");
    }
    return await tokenServices.generateAuthToken(user._id.toString());
  }

  async forgotPassword({ email }) {
    console.log("Searching for email:", email);
    const user = await USER.findOne({ email });
    console.log("Found user:", user);

    if (!user) {
      throw new APIError(404, "User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save reset token in Token model
    const expiryDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await TOKEN.create({
      userID: user._id,
      passwordResetToken: hashedToken,
      passwordResetExpires: expiryDate,
      expiryDate,
    });

    // Send reset password email with the unencrypted token
    await emailServices.sendResetPassword({ email, resetToken });

    return { resetToken };
  }

  async resetPassword({ resetToken, email, password }) {
    // Hash the token to compare with hashed token in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const tokenDoc = await TOKEN.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).populate("userID");

    if (!tokenDoc || tokenDoc.userID.email !== email) {
      throw new APIError(400, "Invalid or expired reset token");
    }

    const user = tokenDoc.userID;
    user.password = password;
    await user.save();

    // Remove the used token
    await TOKEN.deleteOne({ _id: tokenDoc._id });

    return user;
  }

  async sendVerifyEmail({ email }) {
    const user = await USER.findOne({
      email,
    });

    if (!user) {
      throw new APIError(400, "User not found");
    }

    if (user.isVerified === true) {
      throw new APIError(400, "User has already verified");
    }

    //email verification token
    const emailVerificationToken = crypto.createHash("sha256").digest("hex");

    // Save the token to user record
    user.emailVerificationToken = emailVerificationToken;
    await user.save();

    //send email verification
    await emailServices.sendVerificationEmail({
      email,
      emailVerificationToken,
    });
  }

  async verifyEmail({ email, token }) {
    const user = await USER.findOne({
      email,
    });

    if (!user) {
      throw new APIError(400, "User not found");
    }

    // Check if already verified first
    if (user.isVerified) {
      throw new APIError(400, "Email is already verified");
    }

    // Check token only if not verified yet
    if (user.emailVerificationToken !== token || !user.emailVerificationToken) {
      throw new APIError(400, "Invalid verification token");
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return user;
  }
}

module.exports = new AuthService();
