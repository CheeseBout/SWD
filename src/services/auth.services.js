const USER = require("../models/user.model");
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
    photoURL,
    role = "user",
  }) {
    const existingUser = await USER.findOne({ email });
    if (existingUser) {
      throw new APIError(400, "User has already existed");
    }

    // Create base user
    const user = await USER.create({
      fullname,
      username,
      email,
      password,
      dob,
      gender,
      photoURL,
      role,
    });

    return {
      user,
      role,
    };
  }

  async updateExpertProfile(
    userId,
    {
      title,
      issuedBy,
      issuedDate,
      expiryDate,
      documentURL,
      description,
      category,
    }
  ) {
    const user = await USER.findById(userId);

    if (!user) {
      throw new APIError(404, "User not found");
    }

    if (user.role !== "couple_therapist") {
      throw new APIError(400, "User is not an couple therapist");
    }

    // Check if expert profile already exists
    let expert = await COUPLETHERAPIST.findOne({ userID: userId });
    if (expert) {
      throw new APIError(400, "Expert profile already exists");
    }

    // Create certificate first
    const certificate = await CERTIFICATE.create({
      title,
      issuedBy,
      issuedDate,
      expiryDate,
      documentURL,
      category,
    });

    // Create expert profile with the new certificate
    expert = await COUPLETHERAPIST.create({
      coupleTherapistID: `EXP${Date.now()}`,
      userID: userId,
      certificate: certificate._id,
      description,
      category,
    });

    // Populate and return expert details
    const populatedExpert = await COUPLETHERAPIST.findById(expert._id)
      .populate("userID")
      .populate("certificate");

    return populatedExpert;
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

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

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

    const user = await USER.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    console.log("User", user);

    if (!user) {
      throw new APIError(400, "Invalid or expired reset token");
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

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
