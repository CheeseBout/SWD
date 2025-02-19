const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const USER = require("../models/user.model");
const nodemailer = require("nodemailer");
const appConfig = require("../configs/app.config");
const APIError = require("../utils/ApiError");

const bcrypt = require("bcryptjs");
const tokenServices = require("./token.services");

const transporter = nodemailer.createTransport(appConfig.GOOGLEAPIMAIL);

const mailOptions = (email, subject, text, html) => {
  return {
    from: appConfig.GOOGLEAPIMAIL.auth.user,
    to: email,
    subject: subject,
    text: text,
    html: html,
  };
};

class EmailService {
  sendEmail = async (email, subject, text, html) => {
    const options = mailOptions(email, subject, text, html);
    return await transporter.sendMail(options);
  };

  sendVerificationEmail = async ({ email, emailVerificationToken }) => {
    const user = await USER.findOne({
      email,
    });

    if (!user) {
      throw new APIError(400, "User not found");
    }

    try {
      const verificationLink = `http://localhost:5173/verify-email?token=${emailVerificationToken}`;
      const verificationHTML = `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2 style="color: #007bff;">Email Verification</h2>
          <p>Please click the button below to verify your email:</p>
          <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #28a745; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
          <p>If you didn't request this, you can ignore this email.</p>
        </div>
      `;

      return await this.sendEmail(
        email,
        "Email Verification",
        verificationLink,
        verificationHTML
      );
    } catch (error) {
      throw new APIError(500, "Failed to send verification email");
    }
  };

  sendResetPassword = async ({ email, resetToken }) => {
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    const resetHTML = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2 style="color: #dc3545;">Password Reset Request</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #dc3545; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;

    return this.sendEmail(
      email,
      "Password Reset Request",
      resetLink,
      resetHTML
    );
  };
}

module.exports = new EmailService();
