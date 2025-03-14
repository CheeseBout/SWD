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
      // Log the inputs for debugging
      console.log("Creating meeting with params:", {
        startTime,
        endTime,
        userId,
        email,
      });

      const googleCreds = await tokenRepo.findTokenWithGoogleCreds(userId);
      console.log("Google credentials found:", googleCreds ? "Yes" : "No");

      // Check if credentials exist and are valid
      if (
        !googleCreds?.access_token ||
        googleCreds.access_token === "NEED_GOOGLE_AUTH"
      ) {
        console.log(
          "Invalid Google credentials. User needs to authenticate with Google."
        );

        // Return a structured response instead of throwing error
        return {
          error: true,
          requireGoogleAuth: true,
          message:
            "To use this feature, you must connect with your Google Account",
          googleAuthUrl: "/api/v1/auth/login/google",
        };
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

      console.log("Attempting to create Google Calendar event");
      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
        conferenceDataVersion: 1,
      });
      console.log("Google Calendar API response received");

      const meetLink = response.data.hangoutLink;
      if (!meetLink) {
        console.error("No meeting link returned from Google Calendar API");
        throw new APIError(500, "Could not generate meet link");
      }

      console.log("Generated meeting link:", meetLink);

      // Prepare and send email notification
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

      console.log(`Sending confirmation email to ${email}`);
      await sendEmail(
        email,
        "Marriage Counseling Session - Appointment Confirmation",
        meetLink,
        sentMailHTML
      );
      console.log("Email sent successfully");

      return {
        meetLink,
        startTime,
        endTime,
        eventId: response.data.id,
      };
    } catch (error) {
      console.error("Google Meet Error:", error);

      if (
        error.code === 401 ||
        (error.response && error.response.status === 401)
      ) {
        console.log("Google API authorization failed - token likely expired");
        return {
          error: true,
          requireGoogleAuth: true,
          message:
            "Your Google authorization has expired. Please reconnect your Google account.",
          googleAuthUrl: "/api/v1/auth/login/google",
        };
      }

      // For other types of errors
      console.error(
        "Google Calendar API Error Details:",
        error.response
          ? JSON.stringify(error.response.data, null, 2)
          : "No response data"
      );

      throw new APIError(500, `Failed to create meeting: ${error.message}`);
    }
  }
}

module.exports = new GoogleMeetServices();
