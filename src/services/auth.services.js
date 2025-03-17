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
const { getAuthURL } = require("../configs/googleAuth.config");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  async register({
    fullname,
    username,
    email,
    address,
    password,
    dob,
    gender,
    role = "member",
    therapistData = {}, // Add parameter for custom therapist data
  }) {
    try {
      // Check for existing user first
      const existingUser = await authRepo.findUserByEmailAndUsername(
        email,
        username
      );
      if (existingUser) {
        throw new APIError(400, "Email/Username already in use");
      }

      // Create the user document
      const user = await authRepo.createUser({
        fullname,
        username,
        email,
        address,
        password,
        dob: new Date(dob),
        gender,
        role,
        isVerified: false,
      });

      //send verification email
      await this.sendVerifyEmail({ email });

      if (!user._id) {
        throw new APIError(500, "Failed to create user");
      }
      // Create initial token after user is created successfully
      await tokenRepo.createInitialToken(user._id);
      if (role === "couple_therapist") {
        await this.createTherapistProfile(user._id, therapistData); // Pass therapist data
      }
      return { user };
    } catch (error) {
      console.error("Registration error:", error);
      throw error.isOperational ? error : new APIError(400, error.message);
    }
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
      status: "pending",
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
      status: "pending",
      reason: "",
    };

    return await authRepo.updateTherapistProfile(userId, {
      $push: { certificates: therapistCertificate },
      description,
    });
  }

  async createTherapistProfile(userId, therapistData = {}) {
    try {
      if (!userId) {
        throw new APIError(400, "User ID is required");
      }

      // Validate that the user exists
      const user = await authRepo.findUserById(userId);
      if (!user) {
        throw new APIError(404, "User not found");
      }

      // Process certificates if provided
      let processedCertificates = [];
      if (
        therapistData.certificates &&
        Array.isArray(therapistData.certificates)
      ) {
        for (const cert of therapistData.certificates) {
          const { title, issuedDate, expiryDate, documentURL, category } = cert;

          // Create certificate in database
          const certificate = await authRepo.createCertificate({
            title,
            issuedDate,
            expiryDate,
            documentURL,
            category,
            isCertificateVerified: false,
            status: "pending",
          });

          // Format certificate for therapist profile
          processedCertificates.push({
            certificateID: certificate._id,
            title,
            issuedDate,
            expiryDate,
            documentURL,
            category,
            updatedAt: new Date(),
            status: "pending",
          });
        }
      }

      // Use provided values or defaults
      const therapistProfile = await authRepo.createTherapistProfile({
        userID: userId,
        description: therapistData.description || "New Couple Therapist",
        isVerified: therapistData.isVerified || false,
        certificates: processedCertificates, // Use processed certificates
        category: therapistData.category || "General",
        // Add any other customizable fields
      });

      if (!therapistProfile) {
        throw new APIError(500, "Failed to create therapist profile");
      }

      return therapistProfile;
    } catch (error) {
      console.error("Create therapist profile error:", error);
      if (error.isOperational) {
        throw error;
      }
      throw new APIError(400, "Failed to create therapist profile");
    }
  }

  async updateTherapistProfile(userId, therapistData = {}) {
    try {
      if (!userId) {
        throw new APIError(400, "User ID is required");
      }

      // Validate that the user exists and is a therapist
      const user = await authRepo.findUserById(userId);
      if (!user) {
        throw new APIError(404, "User not found");
      }

      if (user.role !== "couple_therapist") {
        throw new APIError(400, "User is not a couple therapist");
      }

      // Find existing therapist profile
      const existingProfile = await authRepo.findTherapistProfile(userId);
      if (!existingProfile) {
        throw new APIError(404, "Therapist profile not found");
      }

      // Create update object with only basic information
      const updateData = {
        $set: {}, // Use $set to update specific fields
      };

      if (therapistData) {
        updateData.$set.isUpdatedInformation = true;
      }

      if (therapistData.description !== undefined) {
        updateData.$set.description = therapistData.description;
      }

      if (therapistData.category !== undefined) {
        updateData.$set.category = therapistData.category;
      }

      // Only update if there are changes
      if (Object.keys(updateData.$set).length > 0) {
        const updatedProfile = await authRepo.updateTherapistProfile(
          userId,
          updateData
        );
        return updatedProfile;
      }

      return existingProfile;
    } catch (error) {
      console.error("Update therapist profile error:", error);
      if (error.isOperational) {
        throw error;
      }
      throw new APIError(
        400,
        "Failed to update therapist profile: " + error.message
      );
    }
  }

  async login(credentials) {
    if (!credentials?.email || !credentials?.password) {
      throw new APIError(400, "Email and password are required");
    }

    const user = await authRepo.findUserByEmail(credentials.email);
    if (!user) {
      throw new APIError(400, "User not found");
    }

    const isPasswordMatch = await bcrypt.compare(
      credentials.password,
      user.password
    );
    if (!isPasswordMatch) {
      throw new APIError(400, "Email or password is incorrect");
    }

    console.log("Email", credentials.email);

    if (user && user.isVerified === false) {
      this.sendVerifyEmail({ email: credentials.email });
    }

    // Update login token
    await tokenRepo.updateLoginToken(user._id);

    // Generate auth tokens
    const tokens = await tokenServices.generateAuthToken(user._id.toString());

    // Check Google authorization
    const googleTokens = await tokenRepo.findTokenWithGoogleCreds(user._id);
    const needsGoogleAuth =
      !googleTokens?.access_token ||
      googleTokens.access_token === "NEED_GOOGLE_AUTH";

    return {
      tokens,
      user,
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

    // Generate a random token without hashing
    const resetToken = crypto.randomBytes(32).toString("hex");

    console.log("Generated reset token:", resetToken);

    // Clear any existing reset tokens for this user first
    await TOKEN.updateMany(
      { userID: user._id },
      { $unset: { passwordResetToken: "", passwordResetExpires: "" } }
    );

    // Store the plain token directly in the database
    await tokenRepo.createPasswordResetToken({
      userID: user._id,
      passwordResetToken: resetToken, // Store plain token, no hashing
      passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
      expiryDate: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send the plain token to the user
    await emailServices.sendResetPassword({ email, resetToken });

    return { message: "Password reset email sent successfully" };
  }

  async resetPassword({ resetToken, email, password }) {
    // Add logging to debug the issue
    console.log("Reset password request received:", {
      resetToken: resetToken?.substring(0, 10) + "...", // Show part of the token for debugging
      email,
      passwordLength: password?.length,
    });

    // Important: Use the imported USER constant instead of relying on mongoose.model('User')
    const user = await USER.findOne({ email });
    if (!user) {
      throw new APIError(404, "User not found");
    }

    // Find token without using populate to avoid the model registration issues
    const tokenDoc = await TOKEN.findOne({
      userID: user._id,
      passwordResetToken: resetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    console.log("Token document found:", tokenDoc ? "Yes" : "No");

    if (!tokenDoc) {
      throw new APIError(400, "Invalid or expired reset token");
    }

    // Update user password
    user.password = password;
    await user.save();

    // Delete the token to prevent reuse
    await tokenRepo.deleteToken(tokenDoc._id);

    // Return success with minimal user info
    return {
      email: user.email,
      message: "Password reset successful",
    };
  }

  async sendVerifyEmail({ email }) {
    const user = await userRepo.getByEmail({ email });

    if (!user) {
      throw new APIError(400, "User not found");
    }

    if (user.isVerified === true) {
      throw new APIError(400, "User has already verified");
    }

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    // Create email verification token
    await TOKEN.findOneAndUpdate(
      { userID: user._id },
      {
        emailVerificationToken: emailVerificationToken,
        expiryDate: new Date(
          Date.now() + ms(appConfig.JWT.emailVerificationLife)
        ),
        updatedAt: new Date(),
      },
      { upsert: true }
    );

    await emailServices.sendVerificationEmail({
      email,
      emailVerificationToken,
    });
  }

  async verifyEmail({ email, token }) {
    const user = await userRepo.getByEmail({ email });

    if (!user) {
      throw new APIError(400, "User not found");
    }

    if (user.isVerified) {
      throw new APIError(400, "Email is already verified");
    }

    // Find token document directly
    const tokenDoc = await TOKEN.findOne({
      userID: user._id,
      emailVerificationToken: token,
    });

    if (!tokenDoc) {
      throw new APIError(400, "Invalid or expired verification token");
    }

    user.isVerified = true;
    // Ensure address exists to avoid validation errors
    // if (!user.address) {
    //   user.address = "None";
    // }
    await user.save();

    return user;
  }

  async loginWithGoogle(idToken, role = "member", therapistData = {}) {
    try {
      if (!idToken) {
        throw new APIError(400, "Missing Google ID Token");
      }

      console.log(
        "Verifying token with client ID:",
        process.env.GOOGLE_FIREBASE_WEB_CLIENT_ID
      );

      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: [
          appConfig.GOOGLE.FIREBASE_WEB_ID,
          appConfig.GOOGLE.ANDROID_ID,
          appConfig.GOOGLE.IOS_ID,
        ],
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
        aud: payload.aud,
        iss: payload.iss,
      });

      const googleEmail = payload.email;
      let user = await authRepo.findUserByEmail(googleEmail);

      // If user doesn't exist, create new one with specified role
      if (!user) {
        console.log("Creating new user with role:", role);
        const randomPassword = crypto.randomBytes(20).toString("hex");

        user = await authRepo.createUser({
          fullname: payload.name || googleEmail,
          username: googleEmail.split("@")[0],
          email: googleEmail,
          password: randomPassword,
          dob: new Date(),
          gender: "other",
          photoURL: payload.picture,
          role: role, // Use the provided role
          isVerified: true,
          address: "None",
          isGoogleUser: true,
        });

        // If user is created as couple_therapist, create a basic therapist profile
        // We'll update it later with the dedicated updateTherapistProfile API
        if (role === "couple_therapist") {
          await this.createTherapistProfile(user._id);
        }
      } else {
        console.log("Existing user found with role:", user.role);
      }

      // Generate auth tokens
      const { accessToken, refreshToken } =
        await tokenServices.generateAuthToken(user._id.toString());

      return {
        user: {
          _id: user._id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          dob: user.dob,
          gender: user.gender,
          photoURL: user.photoURL,
          role: user.role,
          isVerified: true,
          address: user.address || "None",
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error("Google login service error details:", error);

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

    //check if new password is the same as old password
    const isSamePassword = await user.matchPassword(newPassword);
    if (isSamePassword) {
      throw new APIError(400, "New password is the same as the old password");
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      throw new APIError(400, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return user;
  }

  async getTherapistGoogleAuthUrl(req) {
    const userId = req?.user?._id;
    const userRole = req?.user?.role;

    if (!userId) {
      throw new APIError(401, "Authentication required");
    }

    if (userRole !== "couple_therapist") {
      throw new APIError(403, "Only therapists can connect Google accounts");
    }

    // Check if therapist already has Google credentials
    const tokenRepo = require("../repositories/token.repo");
    const existingCreds = await tokenRepo.findTokenWithGoogleCreds(userId);

    if (
      existingCreds &&
      existingCreds.access_token &&
      existingCreds.access_token !== "NEED_GOOGLE_AUTH"
    ) {
      return {
        message: "Your Google account is already connected",
        status: "connected",
        note: "You can now create meetings for your sessions without further authentication",
      };
    }

    // Import the Google Auth configuration with expanded scopes
    const { getAuthUrl } = require("../configs/googleMeet.config");

    // Generate the Google auth URL with calendar scopes
    const authUrl = getAuthUrl();

    return {
      message:
        "Please use this URL to connect your Google account (only needed once)",
      googleAuthUrl: authUrl,
      note: "After connecting, you'll be able to create meetings for your sessions without further authentication",
    };
  }
}

module.exports = new AuthService();
