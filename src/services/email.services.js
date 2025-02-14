const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const USER = require("../models/user.model");
const nodemailer = require("nodemailer");
const appConfig = require("../configs/app.config");
const APIError = require("../utils/ApiError");

const bcrypt = require("bcryptjs");
const tokenServices = require("./token.services");

const transporter = nodemailer.createTransport(appConfig.GOOGLEAPIMAIL);

const mailOptions = (email, subject, text) => {
  return {
    from: appConfig.GOOGLEAPIMAIL.auth.user,
    to: email,
    subject: subject,
    text: text,
  };
};

class EmailService {
  sendEmail = async (email, subject, text) => {
    const options = mailOptions(email, subject, text);
    return await transporter.sendMail(options);
  };

  async sendVerificationEmail({ email, emailVerificationToken }) {
    const user = await USER.findOne({
      email,
    });

    if (!user) {
      throw new APIError(400, "User not found");
    }

    try {
      const verificationText = `Verify your email: http://localhost:5173/verify-email?token=${emailVerificationToken}`;
      const result = await this.sendEmail(
        email,
        "Email Verification",
        verificationText
      );

      return result;
    } catch (error) {
      throw new APIError(500, "Failed to send verification email");
    }
  }

  async sendResetPassword({ email, resetToken }) {
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    const text = `
Password Reset Request

Click the link below to reset your password:
${resetLink}

This link will expire in 10 minutes.
If you didn't request this, please ignore this email.
    `;

    return this.sendEmail(email, "Password Reset Request", text);
  }
}

module.exports = new EmailService();
