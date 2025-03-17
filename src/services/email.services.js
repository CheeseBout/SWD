const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const USER = require("../models/user.model");
const nodemailer = require("nodemailer");
const appConfig = require("../configs/app.config");
const APIError = require("../utils/ApiError");

const bcrypt = require("bcryptjs");
const tokenServices = require("./token.services");
const userRepo = require("../repositories/user.repo");

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
    const user = await userRepo.getByEmail(email);

    if (!user) {
      throw new APIError(400, "User not found");
    }

    try {
      const verificationLink = `http://localhost:5173/verify-email?token=${emailVerificationToken}&email=${email}`;
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
    // Send the original token (not hashed) to the user
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&email=${email}`;

    console.log("Reset link generated:", resetLink);

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

  async sendCertificateStatus({
    email,
    certificateTitle,
    status,
    reason = null,
  }) {
    const subject = `Certificate ${
      status === "approved" ? "Approved" : "Denied"
    } - ${certificateTitle}`;

    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: ${status === "approved" ? "#28a745" : "#dc3545"};">
          Certificate ${status === "approved" ? "Approved" : "Denied"}
        </h2>
        <p>Dear Therapist,</p>
        <p>Your certificate "<strong>${certificateTitle}</strong>" has been ${status}.</p>
    `;

    if (status === "approved") {
      html += `
        <p>You can now provide counseling services on our platform.</p>
        <p>Congratulations!</p>
      `;
    } else if (status === "denied") {
      html += `
        <p>Reason for denial:</p>
        <p style="padding: 10px; background-color: #f8d7da; border-radius: 4px;">
          ${reason || "No specific reason provided"}
        </p>
        <p>Please review the reason and submit a new certificate if needed.</p>
      `;
    }

    html += `
        <p>Thank you for your participation.</p>
        <p>Best regards,<br>Admin Team</p>
      </div>
    `;

    await this.sendEmail(email, subject, "Certificate Status Update", html);
  }
}

module.exports = new EmailService();
