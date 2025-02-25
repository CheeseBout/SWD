const APIError = require("../utils/ApiError");
const { google } = require("googleapis");
const { oauth2Client } = require("../configs/googleMeet.config");
const tokenRepo = require("../repositories/token.repo");
const { sendEmail } = require("./email.services");

class GoogleMeetServices {
  async createMeeting({ startTime, endTime, userId, email }) {
    if (!startTime || !endTime) {
      throw new APIError(400, "Start time and end time are required");
    }

    if (!userId) {
      throw new APIError(400, "User ID is required");
    }

    try {
      const googleCreds = await tokenRepo.findTokenWithGoogleCreds(userId);

      if (
        !googleCreds?.access_token ||
        googleCreds.access_token === "NEED_GOOGLE_AUTH"
      ) {
        throw new APIError(401, {
          message:
            "To use this feature, you must connect with your Google Account",
          requireGoogleAuth: true,
          googleAuthUrl: "/api/v1/auth/login/google",
        });
      }

      oauth2Client.setCredentials({
        access_token: googleCreds.access_token,
      });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      const event = {
        summary: "Buổi tư vấn trực tuyến",
        description: "Online counseling session",
        start: {
          dateTime: new Date(startTime).toISOString(),
          timeZone: "Asia/Ho_Chi_Minh",
        },
        end: {
          dateTime: new Date(endTime).toISOString(),
          timeZone: "Asia/Ho_Chi_Minh",
        },
        conferenceData: {
          createRequest: {
            requestId: Date.now().toString(),
          },
        },
      };

      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
        conferenceDataVersion: 1,
      });

      const meetLink = response.data.hangoutLink;
      if (!meetLink) {
        throw new APIError(500, "Could not generate meet link");
      }
      const sentMailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #2c3e50; text-align: center;">Meeting Scheduled Successfully</h2>
          <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 4px;">
        <p style="margin: 10px 0;">Your online counseling session has been scheduled.</p>
        <p style="margin: 10px 0;"><strong>Start Time:</strong> ${new Date(
          startTime
        ).toLocaleString("vi-VN")}</p>
        <p style="margin: 10px 0;"><strong>End Time:</strong> ${new Date(
          endTime
        ).toLocaleString("vi-VN")}</p>
        <a href="${meetLink}" style="display: block; padding: 10px; background-color: #4285f4; color: white; text-decoration: none; text-align: center; border-radius: 4px; margin: 15px 0;">Join Meeting</a>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center;">Please join the meeting on time using the link above.</p>
        </div>
      `;

      await sendEmail(
        email,
        "Marriage Counseling Session - Appointment Confirmation",
        meetLink,
        sentMailHTML
      );

      return {
        meetLink,
        startTime,
        endTime,
        eventId: response.data.id,
      };
    } catch (error) {
      if (error.statusCode === 401) {
        throw error; // Re-throw authorization errors with our custom format
      }
      console.error("Google Calendar Error:", error.response?.data || error);
      throw new APIError(500, "Failed to create meeting: " + error.message);
    }
  }
}

module.exports = new GoogleMeetServices();
