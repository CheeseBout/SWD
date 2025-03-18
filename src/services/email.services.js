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
    const user = await userRepo.getByEmail({ email });

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

  async sendPaymentNotification({
    email,
    name,
    therapistName,
    amount,
    date,
    phase,
    isComplete,
    sessionDate,
    transactionCode,
  }) {
    const subject = isComplete
      ? "Payment Completed - Thank You!"
      : `Payment Confirmation - ${
          phase === "DEPOSIT" ? "Deposit" : "Final Payment"
        }`;

    let phaseDescription;
    if (phase === "DEPOSIT") {
      phaseDescription = "Initial Deposit";
    } else if (phase === "FINAL") {
      phaseDescription = "Final Payment";
    } else {
      phaseDescription = "Payment";
    }

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-top-left-radius: 5px; border-top-right-radius: 5px;">
          <h1 style="margin: 0; font-size: 24px;">Payment Receipt</h1>
          <p style="margin: 5px 0 0 0;">Thank you for your payment</p>
        </div>
        
        <!-- Receipt Body -->
        <div style="padding: 30px; background-color: white;">
          <div style="border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Your ${phaseDescription.toLowerCase()} has been successfully processed.</p>
          </div>
          
          <!-- Payment Details Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; width: 40%;"><strong>Transaction ID:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><code style="background-color: #f4f4f4; padding: 3px 5px; border-radius: 3px;">${transactionCode}</code></td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 18px; color: #4CAF50;">$${amount}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Date:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Payment Type:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${phaseDescription}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Payment Status:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <span style="color: ${
                  isComplete ? "#4CAF50" : "#FF9800"
                }; font-weight: bold;">
                  ${
                    isComplete ? "Completed" : "Partial - More Payment Required"
                  }
                </span>
              </td>
            </tr>
          </table>
          
          <!-- Session Details -->
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="margin-top: 0; font-size: 18px; color: #333;">Session Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0;"><strong>Therapist:</strong></td>
                <td style="padding: 8px 0;">${therapistName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Session Date:</strong></td>
                <td style="padding: 8px 0;">${sessionDate}</td>
              </tr>
            </table>
          </div>
          
          ${
            isComplete
              ? `<div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
              <p style="margin: 0; color: #2E7D32;"><strong>Your service is now fully paid.</strong> We look forward to seeing you at your session.</p>
            </div>`
              : `<div style="background-color: #fff8e1; padding: 15px; border-left: 4px solid #FFC107; margin: 20px 0;">
              <p style="margin: 0; color: #FF8F00;"><strong>Reminder:</strong> A remaining balance must be paid before your session. Please complete your payment to confirm your booking.</p>
            </div>`
          }
          
          <p>If you have any questions about your payment or services, please don't hesitate to contact our support team.</p>
          <p>Thank you for choosing our services.</p>
          <p style="margin-bottom: 0;">Best regards,<br>Marriage Counseling Team</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; color: #777; font-size: 12px; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;">
          <p style="margin: 0;">Please keep this email for your records.</p>
          <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Marriage Counseling Services. All rights reserved.</p>
        </div>
      </div>
    `;

    await this.sendEmail(
      email,
      subject,
      `Payment Receipt - Transaction ID: ${transactionCode}`,
      html
    );
  }

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
