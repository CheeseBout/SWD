const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const USER = require("../models/user.model");
const nodemailer = require("nodemailer");
const appConfig = require("../configs/app.config");
const APIError = require("../utils/ApiError");
const transporter = nodemailer.createTransport(appConfig.email);

const bcrypt = require("bcryptjs");
const tokenServices = require("./token.services");

class EmailService {
  constructor() {
    this.mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY,
    });
  }

  sendEmail = async ({ to, subject, html }) => {
    const msg = { from: "anh Long", to, subject, html };
    return await transporter.sendMail(msg);
  };

  async sendVerificationEmail({ email, emailVerificationToken }) {
    const user = await USER.findOne({
      email,
    });

    if (!user) {
      throw new APIError(400, "User not found");
    }

    try {
      const result = await this.sendEmail({
        to: email,
        subject: "Email Verification",
        text: `Verify your email: ${email}`,
        html: `Verify your email: <a href="http://localhost:5173/verify-email?token=${emailVerificationToken}">Verify Email</a>`,
      });

      return result;
    } catch (error) {
      throw new APIError(500, "Failed to send verification email");
    }
  }

  async sendResetPassword({ email, resetToken }) {
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    const html = `
      <h1 style="color: red">Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: "Password Reset Request",
      text: `Reset your password: ${resetLink}`,
      html: html,
    });
  }
}

module.exports = new EmailService();
